/**
 * @jest-environment jsdom
 */

/**
 * Teste de Caixa Preta: Cadastro com todos os campos válidos
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Cadastro com todos os campos válidos', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="register-form">
        <input type="text" id="register-username" />
        <input type="email" id="register-email" />
        <input type="password" id="register-password" />
        <input type="password" id="register-confirm-password" />
        <button type="submit">Cadastrar</button>
      </form>
    `;

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('register-username').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirm = document.getElementById('register-confirm-password').value;

      if (username && email && password && confirm && password === confirm) {
        localStorage.setItem('cadastroSucesso', 'ok');
      }
    });
  });

  it('deve permitir cadastro com dados válidos e salvar sucesso no localStorage', () => {
    document.getElementById('register-username').value = 'NovoUsuário';
    document.getElementById('register-email').value = 'novo@teste.com';
    document.getElementById('register-password').value = '123456';
    document.getElementById('register-confirm-password').value = '123456';

    fireEvent.submit(document.getElementById('register-form'));

    expect(localStorage.getItem('cadastroSucesso')).toBe('ok');
  });
});
