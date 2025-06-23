/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Criação de tarefa com data no passado', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="task-form">
        <input type="text" id="title" />
        <textarea id="description"></textarea>
        <input type="date" id="dueDate" />
        <button type="submit">Criar</button>
        <div id="error-message"></div>
      </form>
    `;

    document.getElementById('task-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const dueDate = document.getElementById('dueDate').value;
      const errorMessage = document.getElementById('error-message');

      const hoje = new Date().toISOString().split('T')[0];
      if (dueDate < hoje) {
        errorMessage.textContent = 'A data não pode estar no passado.';
      } else {
        errorMessage.textContent = '';
      }
    });
  });

  it('deve exibir mensagem de erro ao tentar criar tarefa com data passada', () => {
    document.getElementById('title').value = 'Tarefa com data inválida';
    document.getElementById('description').value = 'Tentativa de tarefa';
    
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    document.getElementById('dueDate').value = ontem;

    const form = document.getElementById('task-form');
    fireEvent.submit(form);

    const errorMessage = document.getElementById('error-message');
    expect(errorMessage).toHaveTextContent('A data não pode estar no passado.');
  });
});
