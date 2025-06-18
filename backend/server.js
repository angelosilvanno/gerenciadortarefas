const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const app = express();

// Lista de origens permitidas para acessar a API
const allowedOrigins = [
  'https://nexttaskweb.vercel.app/', // Sua URL de produção
  'http://127.0.0.1:5500',         // Ambiente de desenvolvimento local
  'http://localhost:5500'          // Alternativa para desenvolvimento local
];

const corsOptions = {
  origin: allowedOrigins
};


app.use(cors(corsOptions));

app.use(express.json());

// 3. Importa os arquivos de rota.
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const extraRoutes = require("./routes/extraRoutes");

app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", extraRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});