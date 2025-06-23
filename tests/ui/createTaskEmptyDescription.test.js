/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Criação de Tarefa com Descrição Vazia', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="taskForm">
        <input id="taskTitle" value="Tarefa Teste" />
        <textarea id="taskDescription"></textarea>
        <input type="date" id="dueDate" value="2025-06-30" />
        <button type="submit">Criar</button>
        <div id="error" style="display: none;"></div>
      </form>
    `;

    document.getElementById('taskForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('taskTitle').value.trim();
      const description = document.getElementById('taskDescription').value.trim();
      const errorDiv = document.getElementById('error');

      if (!title || !description) {
        errorDiv.textContent = "Todos os campos são obrigatórios";
        errorDiv.style.display = 'block';
      }
    });
  });

  it('deve exibir erro ao tentar criar tarefa com descrição vazia', () => {
    fireEvent.submit(document.getElementById('taskForm'));

    const errorDiv = document.getElementById('error');
    expect(errorDiv).toBeVisible();
    expect(errorDiv.textContent).toBe("Todos os campos são obrigatórios");
  });
});
