/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Cadastro com senha menor que 6 caracteres', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="register-form">
        <input type="text" id="register-username" />
        <input type="email" id="register-email" />
        <input type="password" id="register-password" />
        <button type="submit">Cadastrar</button>
        <div id="error-message"></div>
      </form>
    `;

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const errorDiv = document.getElementById('error-message');

      if (password.length < 6) {
        errorDiv.textContent = 'A senha deve ter no mínimo 6 caracteres.';
      } else {
        localStorage.setItem('newUser', JSON.stringify({ username, email }));
        errorDiv.textContent = '';
      }
    });
  });

  it('deve exibir mensagem de erro ao tentar cadastrar com senha curta', () => {
    const usernameInput = document.getElementById('register-username');
    const emailInput = document.getElementById('register-email');
    const passwordInput = document.getElementById('register-password');
    const form = document.getElementById('register-form');
    const errorDiv = document.getElementById('error-message');

    usernameInput.value = 'NovoUsuario';
    emailInput.value = 'novo@teste.com';
    passwordInput.value = '123'; 

    fireEvent.submit(form);

    expect(errorDiv.textContent).toBe('A senha deve ter no mínimo 6 caracteres.');
    expect(localStorage.getItem('newUser')).toBeNull();
  });
});
