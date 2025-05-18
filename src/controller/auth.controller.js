const db = require('../config/db'); 
const { hashPassword } = require('../utils/hashPassword'); 

async function handleRegister(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios." });
  }
    if (username.length < 3 || username.length > 20) {
        return res.status(400).json({ message: "O nome de usuário deve ter entre 3 e 20 caracteres." });
    }

  try {
    const userExists = await db.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (userExists.rows.length > 0) {
      if (userExists.rows.some(u => u.username === username)) {
        return res.status(409).json({ message: "Nome de usuário já existe." });
      }
      if (userExists.rows.some(u => u.email === email)) {
        return res.status(409).json({ message: "Este e-mail já está cadastrado." });
      }
    }

    const hashedPassword = await hashPassword(password);

    const newUserQuery = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, hashedPassword]
    );
    const newUser = newUserQuery.rows[0];

    res.status(201).json({
      message: "Cadastro realizado com sucesso!",
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        created_at: newUser.created_at
      }
    });

  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ message: 'Erro interno do servidor ao registrar usuário.' });
  }
}

async function handleLogin(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Usuário e senha são obrigatórios." });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    const hashedPasswordAttempt = await hashPassword(password);
    const isMatch = (hashedPasswordAttempt === user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciais inválidas." });
    }

    res.status(200).json({
      message: "Login bem-sucedido!",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
        token: user.token,
        created_at: user.created_at
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ message: 'Erro interno do servidor ao fazer login.' });
  }
}

module.exports = {
  handleRegister,
  handleLogin,
};