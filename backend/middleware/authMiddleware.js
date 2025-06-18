const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Pega o token do cabeçalho
  const authHeader = req.header('Authorization');

  // Verifica se não há token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }
  
  const token = authHeader.split(' ')[1];

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (ex) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};