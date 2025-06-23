/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Criação de tarefa com título vazio', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="task-form">
        <input type="text" id="title" />
        <textarea id="description"></textarea>
        <input type="date" id="dueDate" />
        <button type="submit">Criar</button>
        <p id="error-message" style="display:none;"></p>
      </form>
    `;

    const form = document.getElementById('task-form');
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const dueDateInput = document.getElementById('dueDate');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (titleInput.value.trim() === '') {
        errorMessage.textContent = 'O título é obrigatório.';
        errorMessage.style.display = 'block';
      }
    });
  });

  it('deve exibir mensagem de erro ao tentar criar uma tarefa sem título', () => {
    const form = document.getElementById('task-form');
    const descriptionInput = document.getElementById('description');
    const dueDateInput = document.getElementById('dueDate');

    descriptionInput.value = 'Descrição válida';
    dueDateInput.value = '2025-06-25';

    fireEvent.submit(form);

    const errorMessage = document.getElementById('error-message');
    expect(errorMessage).toBeVisible();
    expect(errorMessage.textContent).toBe('O título é obrigatório.');
  });
});
