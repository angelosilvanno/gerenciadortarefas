/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Login com senha inválida', () => {
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

  it('não deve logar com senha incorreta', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const form = document.getElementById('login-form');

    emailInput.value = 'teste@usuario.com';
    passwordInput.value = 'senhaErrada';

    fireEvent.submit(form);

    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});
