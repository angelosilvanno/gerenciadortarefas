const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function generateToken(userId) {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    console.error("ERRO FATAL: JWT_SECRET não está definida nas variáveis de ambiente.");
    throw new Error("Configuração de segurança do servidor incompleta.");
  }

  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1d' });
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Por favor, preencha todos os campos." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(name, email, hashedPassword);

    res.status(201).json({ 
        success: true, 
        message: "Usuário cadastrado com sucesso!",
        user: { 
          id: newUser.id, 
          name: newUser.name, 
          email: newUser.email 
        }
    });

  } catch (err) {
    if (err.message.includes('já está em uso')) {
      return res.status(409).json({ success: false, message: err.message });
    }

    console.error("Erro no processo de registro:", err);
    res.status(500).json({ success: false, message: "Ocorreu um erro inesperado no servidor." });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Por favor, preencha todos os campos." });
  }

  try {
    const user = await User.findByUsernameOrEmail(username);

    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciais inválidas." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciais inválidas." });
    }
    
    const token = generateToken(user.id);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.error("Erro no processo de login:", err);
    res.status(500).json({ success: false, message: "Ocorreu um erro inesperado no servidor." });
  }
};