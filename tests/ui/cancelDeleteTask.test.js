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

global.confirm = jest.fn(() => false);

const html = fs.readFileSync(
  path.resolve(__dirname, "../../index.html"),
  "utf8"
);

const scriptPath = path.resolve(__dirname, "../../js/script.js");
const scriptContent = fs.readFileSync(scriptPath, "utf8");
eval(scriptContent);

describe("Cancelar exclusão e verificar que a tarefa continua", () => {
  beforeEach(() => {
    document.body.innerHTML = html;

    const taskHTML = `
      <div class="task-card" data-id="123">
        <h5 class="card-title">Tarefa de teste</h5>
        <button class="delete-task-btn" data-id="123">Excluir</button>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", taskHTML);

    localStorage.setItem("currentUser", JSON.stringify({ token: "fake-token" }));
  });

  it("não deve remover a tarefa do DOM se o usuário cancelar a exclusão", async () => {
    const btnExcluir = document.querySelector(".delete-task-btn");
    fireEvent.click(btnExcluir);

    await Promise.resolve();

    const tarefa = document.querySelector(".task-card[data-id='123']");
    expect(tarefa).not.toBeNull();
    expect(showUIMessage).not.toHaveBeenCalled();
  });
});
