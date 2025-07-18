const User = require('../../backend/models/User');
const pool = require('../../backend/db');

beforeAll(async () => {
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.end();
});

describe('User model', () => {
  const userData = {
    name: 'ka',
    email: 'ka@example.com',
    password: 'hashed123',
  };

  test('deve criar um usuário válido', async () => {
    const user = await User.create(userData.name, userData.email, userData.password);
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email);
  });

  test('não deve permitir nome duplicado', async () => {
    await expect(
      User.create(userData.name, 'novoemail@example.com', 'outra')
    ).rejects.toThrow('Este nome de usuário já está em uso.');
  });

  test('não deve permitir email duplicado', async () => {
    await expect(
      User.create('novonome', userData.email, 'outra')
    ).rejects.toThrow('Este e-mail já está em uso.');
  });

  test('findById deve retornar o usuário', async () => {
    const user = await User.findByEmail(userData.email);
    const found = await User.findById(user.id);
    expect(found.email).toBe(userData.email);
  });

  test('findById deve retornar undefined se não existir', async () => {
    const result = await User.findById(99999);
    expect(result).toBeUndefined();
  });

  test('findByEmail deve retornar o usuário', async () => {
    const result = await User.findByEmail(userData.email);
    expect(result.name).toBe(userData.name);
  });

  test('findByEmail deve retornar undefined se não existir', async () => {
    const result = await User.findByEmail('naoexiste@example.com');
    expect(result).toBeUndefined();
  });

  test('findByUsernameOrEmail com nome', async () => {
    const result = await User.findByUsernameOrEmail(userData.name);
    expect(result.email).toBe(userData.email);
  });

  test('findByUsernameOrEmail com email', async () => {
    const result = await User.findByUsernameOrEmail(userData.email);
    expect(result.name).toBe(userData.name);
  });

  test('findByUsernameOrEmail retorna undefined se não existir', async () => {
    const result = await User.findByUsernameOrEmail('naoexiste');
    expect(result).toBeUndefined();
  });

  test('deve lançar erro genérico se o erro não tiver código', async () => {
    const originalQuery = pool.query;
  
    pool.query = jest.fn().mockRejectedValue(new Error('Erro inesperado!'));
  
    await expect(
      User.create('teste', 'erro@email.com', '123')
    ).rejects.toThrow('Erro inesperado!');
  
    pool.query = originalQuery; // restaurar
  });
  
});

