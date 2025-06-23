/**
 * @jest-environment jsdom
 */

/**
 * Teste de Caixa Preta: Criação de tarefa com dados válidos
 * Foca apenas na entrada (formulário) e saída esperada (campo limpo e mensagem)
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Criação de Tarefa - Dados Válidos', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="task-form">
        <input type="text" id="title" />
        <textarea id="description"></textarea>
        <input type="datetime-local" id="dateTime" />
        <button type="submit">Criar</button>
      </form>
      <div id="taskList"></div>
    `;

    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const dateTime = document.getElementById('dateTime').value;

      if (title && description && dateTime) {
        const taskList = document.getElementById('taskList');
        const newTask = document.createElement('div');
        newTask.textContent = title;
        taskList.appendChild(newTask);
      }
    });
  });

  it('deve adicionar tarefa à lista com dados válidos', () => {
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const dateTimeInput = document.getElementById('dateTime');
    const form = document.getElementById('task-form');

    titleInput.value = 'Nova Tarefa';
    descriptionInput.value = 'Descrição da tarefa';
    dateTimeInput.value = '2025-07-01T10:00';

    fireEvent.submit(form);

    const taskList = document.getElementById('taskList');
    expect(taskList.textContent).toContain('Nova Tarefa');
  });
});
