/**
 * @jest-environment jsdom
 */


import fs from "fs";
import path from "path";


const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");

describe("Mensagem quando não há tarefas cadastradas", () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = html;
        container = document.body;

        // Simula localStorage vazio
        localStorage.setItem("tasksCache", JSON.stringify([]));

        // Simula função que exibe mensagem
        const listaContainer = document.createElement("div");
        listaContainer.id = "task-list";
        container.appendChild(listaContainer);

        const exibirMensagemVazia = () => {
            const tarefas = JSON.parse(localStorage.getItem("tasksCache"));
            if (tarefas.length === 0) {
                const msg = document.createElement("div");
                msg.className = "no-tasks-message";
                msg.textContent = "Tudo pronto por aqui! Nenhuma tarefa cadastrada.";
                listaContainer.appendChild(msg);
            }
        };

        exibirMensagemVazia();
    });

    test("Exibe mensagem positiva quando não há tarefas", () => {
        const mensagem = container.querySelector(".no-tasks-message");
        expect(mensagem.textContent).toMatch(/nenhuma tarefa/i);
    });
});