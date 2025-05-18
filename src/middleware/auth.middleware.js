// Middleware para autenticação de token JWT
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' }); 

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('Erro: JWT_SECRET não está definido nas variáveis de ambiente.');
    return res.status(500).json({ message: 'Erro de configuração do servidor.' });
  }

  jwt.verify(token, jwtSecret, (err, userPayload) => {
    if (err) {
      console.error('Erro na verificação do JWT:', err.message);
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ message: 'Token expirado.' });
      }
      return res.status(403).json({ message: 'Token inválido.' });
    }

    req.user = userPayload;
    next();
  });
}

module.exports = {
  authenticateToken,
};