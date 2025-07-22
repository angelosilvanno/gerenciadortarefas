/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";
import { fireEvent } from "@testing-library/dom";

const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");

describe("Limpar tarefas concluídas", () => {
    let container;

    beforeEach(() => {
        document.body.innerHTML = html;
        container = document.body;

        // Simula container de tarefas e container de alertas
        container.innerHTML = `
            <div id="task-list"></div>
            <div class="alert-container"></div>
        `;

        // Simula localStorage com tarefas (2 concluídas e 1 pendente)
        const tarefas = [
            { id: 1, title: "Tarefa 1", status: "concluída" },
            { id: 2, title: "Tarefa 2", status: "pendente" },
            { id: 3, title: "Tarefa 3", status: "concluída" }
        ];

        localStorage.setItem("tasksCache", JSON.stringify(tarefas));

        // Simula os cards na DOM
        const taskList = container.querySelector("#task-list");
        tarefas.forEach((tarefa) => {
            const card = document.createElement("div");
            card.classList.add("task-card");
            card.dataset.id = tarefa.id;
            card.dataset.status = tarefa.status;

            const title = document.createElement("span");
            title.classList.add("task-title");
            title.textContent = tarefa.title;

            card.appendChild(title);
            taskList.appendChild(card);
        });

        // Cria botão "Limpar Concluídas"
        const btn = document.createElement("button");
        btn.id = "clear-completed";
        btn.textContent = "Limpar Concluídas";
        container.appendChild(btn);

        btn.addEventListener("click", () => {
            const tasks = JSON.parse(localStorage.getItem("tasksCache")) || [];
            const restantes = tasks.filter((t) => t.status !== "concluída");
            localStorage.setItem("tasksCache", JSON.stringify(restantes));

            document.querySelectorAll(".task-card").forEach((el) => {
                if (el.dataset.status === "concluída") el.remove();
            });

            const msg = document.createElement("div");
            msg.classList.add("alert-success");
            msg.textContent = "Tarefas concluídas removidas!";
            container.querySelector(".alert-container").appendChild(msg);
        });
    });

    test("Remove tarefas concluídas do DOM e localStorage", () => {
        const botao = container.querySelector("#clear-completed");
        fireEvent.click(botao);

        const cardRestantes = container.querySelectorAll(".task-card");
        expect(cardRestantes.length).toBe(1);
        expect(cardRestantes[0].textContent).toMatch(/Tarefa 2/i);

        const armazenadas = JSON.parse(localStorage.getItem("tasksCache"));
        expect(armazenadas.length).toBe(1);
        expect(armazenadas[0].title).toBe("Tarefa 2");
    });

    test("Exibe mensagem visual de sucesso", () => {
        const botao = container.querySelector("#clear-completed");
        fireEvent.click(botao);

        const mensagem = container.querySelector(".alert-success");
        expect(mensagem).not.toBeNull();
        expect(mensagem.textContent).toMatch(/removidas/i);
    });
});
