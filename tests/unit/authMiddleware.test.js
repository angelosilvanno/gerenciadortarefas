const jwt = require('jsonwebtoken');
const authMiddleware = require('../../backend/middleware/authMiddleware');

describe('Middleware de autenticação via token JWT', () => {
  const mockReq = (headerValue) => ({
    header: jest.fn().mockReturnValue(headerValue)
  });

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('deve retornar 401 se nenhum token for fornecido', () => {
    const req = mockReq(null);
    const res = mockRes();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Acesso negado. Nenhum token fornecido.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve retornar 400 se o token for inválido', () => {
    const req = mockReq('Bearer token_invalido');
    const res = mockRes();

    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Token inválido');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token inválido.' });
    expect(next).not.toHaveBeenCalled();
  });

  test('deve chamar next se o token for válido', () => {
    const req = mockReq('Bearer token_valido');
    const res = mockRes();
    const userData = { id: 1, name: 'Usuário Teste' };

    jest.spyOn(jwt, 'verify').mockReturnValue(userData);

    authMiddleware(req, res, next);

    expect(req.user).toEqual(userData);
    expect(next).toHaveBeenCalled();
  });
});
