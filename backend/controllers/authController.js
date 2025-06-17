const User = require("../models/User");

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await User.create(name, email, password);
    res.status(201).json({ success: true, id: user.id });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ success: false, message: "Usuário e/ou e-mail já existe." });
    } else {
      console.error("Erro no cadastro:", err);
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Usuário e/ou senha inválidos" });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name
      }
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ success: false, message: "Erro interno no servidor" });
  }
};
