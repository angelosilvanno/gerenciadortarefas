/**
 * @jest-environment jsdom
 */

/**
 * Teste de Caixa Preta: Login com campos vazios
 * Verifica a saída esperada sem olhar a lógica interna
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Login com campos vazios', () => {
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
      
      if (email && password) {
        localStorage.setItem('currentUser', 'fakeToken123');
      }
    });
  });

  it('não deve logar quando os campos estão vazios', () => {
    const form = document.getElementById('login-form');
    fireEvent.submit(form);

    expect(localStorage.getItem('currentUser')).toBeNull();
  });
});
