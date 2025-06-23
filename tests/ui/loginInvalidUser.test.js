/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Login com usuário não existente', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="login-form">
        <input type="email" id="email" />
        <input type="password" id="password" />
        <button type="submit">Entrar</button>
        <p id="error-message"></p>
      </form>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (email !== 'usuario@valido.com') {
        document.getElementById('error-message').textContent = 'Usuário não encontrado';
        return;
      }

      localStorage.setItem('currentUser', 'fakeToken123');
    });
  });

  it('deve exibir mensagem de erro ao tentar logar com usuário inexistente', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const form = document.getElementById('login-form');

    emailInput.value = 'naoexiste@teste.com';
    passwordInput.value = 'senha123';

    fireEvent.submit(form);

    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(document.getElementById('error-message').textContent).toBe('Usuário não encontrado');
  });
});
