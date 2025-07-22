/**
 * @jest-environment jsdom
 */


import fs from "fs";
import path from "path";

const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");

describe("Atualização do título da aba com contador de tarefas", () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = html;
        container = document.body;

        // Simular função que atualiza o título da aba
        global.atualizarTitulo = () => {
            const tarefas = JSON.parse(localStorage.getItem("tasksCache")) || [];
            const pendentesOuAndamento = tarefas.filter(t => 
                t.status === "pendente" || t.status === "em andamento"
            ).length;
            document.title = `NexTask (${pendentesOuAndamento})`;
        };
    });

    test("Atualizar título com 2 tarefas pendentes ou em andamento", () => {
        const tarefas = [
            { id: 1, title: "Tarefa A", status: "pendente" },
            { id: 2, title: "Tarefa B", status: "em andamento" },
            { id: 3, title: "Tarefa C", status: "concluída" }
        ];
        localStorage.setItem("tasksCache", JSON.stringify(tarefas));

        atualizarTitulo();

        expect(document.title).toBe("NexTask (2)");
    });

    test("Atualiza título com nenhuma tarefa ativa", () => {
        const tarefas = [
            { id: 1, title: "Tarefa C", status: "concluída" }
        ];
        localStorage.setItem("tasksCache", JSON.stringify(tarefas));

        atualizarTitulo();

        expect(document.title).toBe("NexTask (0)");
    });

    test("Atualiza título após mudança no status da tarefa", () => {
        // Primeiro estado: 2 tarefas pendentes
        let tarefas = [
            { id: 1, title: "Tarefa D", status: "pendente" },
            { id: 2, title: "Tarefa E", status: "pendente" }
        ];
        localStorage.setItem("tasksCache", JSON.stringify(tarefas));
        atualizarTitulo();
        expect(document.title).toBe("NexTask (2)");
    
        // Atualiza status da tarefa 1 para "concluída"
        tarefas[0].status = "concluída";
        localStorage.setItem("tasksCache", JSON.stringify(tarefas)); 
        atualizarTitulo();
        expect(document.title).toBe("NexTask (1)");
    });    
});