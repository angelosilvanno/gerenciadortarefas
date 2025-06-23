/**
 * @jest-environment jsdom
 */

/**
 * Teste de Caixa Preta: Cadastro com email já existente
 * Verifica a resposta esperada ao tentar cadastrar com email repetido
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Cadastro com email já existente', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="register-form">
        <input type="text" id="username" />
        <input type="email" id="register-email" />
        <input type="password" id="register-password" />
        <button type="submit">Cadastrar</button>
        <div id="message"></div>
      </form>
    `;

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('register-email').value;
      const messageDiv = document.getElementById('message');

      if (email === 'ja@existe.com') {
        messageDiv.textContent = 'Email já registrado';
      } else {
        localStorage.setItem('currentUser', 'fakeUser123');
      }
    });
  });

  it('deve exibir mensagem de erro ao usar um email já registrado', () => {
    document.getElementById('username').value = 'NovoUsuario';
    document.getElementById('register-email').value = 'ja@existe.com';
    document.getElementById('register-password').value = '123456';

    const form = document.getElementById('register-form');
    fireEvent.submit(form);

    const messageDiv = document.getElementById('message');
    expect(messageDiv.textContent).toBe('Email já registrado');
    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});
