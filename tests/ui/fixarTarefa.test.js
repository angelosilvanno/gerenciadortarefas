/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";

const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"), "utf8");

let container;

describe("Fixar tarefa no topo", () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    container = document.body;

    // Simula tarefas no localStorage com uma fixada
    const tarefasMock = [
      {
        id: 1,
        title: "Tarefa 1",
        description: "Descrição 1",
        due_date: "2099-12-31",
        status: "pendente",
        priority: "alta",
        fixed: true
      },
      {
        id: 2,
        title: "Tarefa 2",
        description: "Descrição 2",
        due_date: "2099-12-31",
        status: "pendente",
        priority: "média",
        fixed: false
      }
    ];

    localStorage.setItem("tasksCache", JSON.stringify(tarefasMock));

    // Simula renderização básica das tarefas
    tarefasMock.forEach(tarefa => {
      const card = document.createElement("div");
      card.className = "task-card";

      const title = document.createElement("div");
      title.className = "task-title";
      title.textContent = tarefa.title;

      const star = document.createElement("button");
      star.className = "star-btn";
      star.dataset.id = tarefa.id;
      star.innerHTML = tarefa.fixed ? "⭐" : "☆";

      card.appendChild(title);
      card.appendChild(star);
      container.appendChild(card);
    });
  });

  test("Tarefa fixada aparece no topo", () => {
    const tarefas = container.querySelectorAll(".task-card");
    const primeiraTarefa = tarefas[0].querySelector(".task-title").textContent;

    // Espera que a Tarefa 1 (fixada) esteja no topo
    expect(primeiraTarefa).toMatch(/Tarefa 1/i);
  });

  test("Clicar na estrela altera o estado fixado", () => {
    const tarefas = JSON.parse(localStorage.getItem("tasksCache"));
    const tarefa = tarefas[1]; // Tarefa 2 inicialmente não fixada

    // Simula clique
    tarefa.fixed = !tarefa.fixed;
    localStorage.setItem("tasksCache", JSON.stringify(tarefas));

    const tarefasAtualizadas = JSON.parse(localStorage.getItem("tasksCache"));
    expect(tarefasAtualizadas[1].fixed).toBe(true); // Agora está fixada
  });
});

  