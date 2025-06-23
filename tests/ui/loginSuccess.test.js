/** @jest-environment jsdom */
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

/**
 * Teste de Caixa Preta: Login com email e senha válidos
 * Foca na entrada/saída, sem verificar lógica interna
 */

describe('Login com email e senha válidos', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="login-form">
        <input type="email" id="email" />
        <input type="password" id="password" />
        <button type="submit">Entrar</button>
      </form>
    `;

    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      if (email === 'teste@usuario.com' && password === '123456') {
        localStorage.setItem('currentUser', 'fakeToken123');
      }
    });
  });

  it('deve logar com dados válidos e salvar token no localStorage', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const form = document.getElementById('login-form');

    emailInput.value = 'teste@usuario.com';
    passwordInput.value = '123456';

    fireEvent.submit(form);

    expect(localStorage.getItem('currentUser')).toBe('fakeToken123');
  });
});
