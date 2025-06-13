const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Rota de cadastro
app.post("/api/cadastrar", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, password]
    );
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (err) {
    if (err.code === "23505") {
      res.status(400).json({ success: false, message: "Usuário e/ou e-mail já existe" });
    } else {
      res.status(500).json({ success: false, message: "Erro interno do servidor" });
    }
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
