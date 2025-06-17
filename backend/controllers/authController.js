const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Função para gerar o token JWT
function generateToken(userId) {
  // A "secret" deve ser uma string complexa e guardada em variáveis de ambiente em produção
  const jwtSecret = "sua_chave_secreta_super_dificil_de_adivinhar"; 
  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: '1d' }); // O token expira em 1 dia
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Validação básica dos dados de entrada
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Por favor, preencha todos os campos." });
  }

  try {
    // 2. Hash da senha antes de salvar no banco
    const salt = await bcrypt.genSalt(10); // Gera um "sal" para o hash
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Chama o model para criar o usuário com a senha hasheada
    const newUser = await User.create(name, email, hashedPassword);

    // 4. Responde com sucesso (não é necessário gerar token no registro)
    res.status(201).json({ 
        success: true, 
        message: "Usuário cadastrado com sucesso!",
        user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });

  } catch (err) {
    // Erro de usuário/email duplicado que vem do nosso Model
    if (err.message.includes('já está em uso')) {
      return res.status(409).json({ success: false, message: err.message }); // 409 Conflict
    }

    console.error("Erro no cadastro:", err);
    res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body; // 'username' pode ser o nome ou o email

  // 1. Validação básica
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Por favor, preencha todos os campos." });
  }

  try {
    // 2. Busca o usuário pelo nome ou e-mail (usando a função sugerida no Model)
    const user = await User.findByUsernameOrEmail(username);

    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciais inválidas." });
    }

    // 3. Compara a senha enviada com o hash salvo no banco
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Credenciais inválidas." });
    }
    
    // 4. Se a senha estiver correta, gera o Token JWT
    const token = generateToken(user.id);
    
    // 5. Responde com sucesso, enviando o token e os dados do usuário
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
    console.error("Erro no login:", err);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};