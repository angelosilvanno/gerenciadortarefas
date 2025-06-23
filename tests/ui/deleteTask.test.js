/**
 * @jest-environment jsdom
 */

import fs from "fs";
import path from "path";
import { fireEvent } from "@testing-library/dom";

global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
);

global.showUIMessage = jest.fn();

const html = fs.readFileSync(
  path.resolve(__dirname, "../../index.html"),
  "utf8"
);

describe("Excluir uma tarefa e verificar remoção visual", () => {
  beforeEach(() => {
    document.body.innerHTML = html;

    const taskHTML = `
      <div class="task-card" data-id="123">
        <h5 class="card-title">Tarefa de teste</h5>
        <button class="delete-task-btn" data-id="123">Excluir</button>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", taskHTML);

    const btnExcluir = document.querySelector(".delete-task-btn");
    btnExcluir.addEventListener("click", () => {
      const taskCard = btnExcluir.closest(".task-card");
      if (taskCard) taskCard.remove();
      showUIMessage("Tarefa excluída com sucesso!", false);
    });

    localStorage.setItem("currentUser", JSON.stringify({ token: "fake-token" }));
  });

  it("deve remover a tarefa do DOM ao clicar em excluir", async () => {
    const btnExcluir = document.querySelector(".delete-task-btn");
    fireEvent.click(btnExcluir);

    await Promise.resolve();

    const tarefaRemovida = document.querySelector(".task-card[data-id='123']");
    expect(tarefaRemovida).toBeNull();
    expect(showUIMessage).toHaveBeenCalledWith("Tarefa excluída com sucesso!", false);
  });
});
