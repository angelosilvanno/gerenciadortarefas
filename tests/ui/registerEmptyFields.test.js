/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

describe('Cadastro com todos os campos vazios', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="register-form">
        <input type="text" id="username" />
        <input type="email" id="registerEmail" />
        <input type="password" id="registerPassword" />
        <input type="password" id="confirmRegisterPassword" />
        <button type="submit">Cadastrar</button>
      </form>
      <div id="mensagem"></div>
    `;

    document.getElementById('register-form').addEventListener('submit', (e) => {
      e.preventDefault();

      const nome = document.getElementById('username').value.trim();
      const email = document.getElementById('registerEmail').value.trim();
      const senha = document.getElementById('registerPassword').value.trim();
      const confirmar = document.getElementById('confirmRegisterPassword').value.trim();
      const msg = document.getElementById('mensagem');

      if (!nome || !email || !senha || !confirmar) {
        msg.textContent = 'Por favor, preencha todos os campos.';
      } else {
        msg.textContent = 'Cadastro enviado.'; // (não ocorre nesse teste)
      }
    });
  });

  it('deve exibir mensagem de erro ao submeter com todos os campos vazios', () => {
    const form = document.getElementById('register-form');
    const mensagem = document.getElementById('mensagem');

    fireEvent.submit(form);

    expect(mensagem.textContent).toBe('Por favor, preencha todos os campos.');
  });
});
