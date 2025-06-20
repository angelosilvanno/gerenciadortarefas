const { validarLogin } = require('../../backend/utils/validationUtils');

describe('Função validarLogin', () => {
  test('deve retornar "ok" se email e senha forem preenchidos', () => {
    expect(validarLogin('teste@email.com', '123456')).toBe('ok');
  });

  test('deve retornar "Email obrigatório" se o email estiver vazio', () => {
    expect(validarLogin('', '123456')).toBe('Email obrigatório');
  });

  test('deve retornar "Senha obrigatória" se a senha estiver vazia', () => {
    expect(validarLogin('teste@email.com', '')).toBe('Senha obrigatória');
  });
});
