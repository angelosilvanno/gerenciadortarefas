const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const app = express();

// Lista de origens (domínios) que têm permissão para acessar esta API
const allowedOrigins = [
  'https://nexttaskweb.vercel.app', // Sua URL de produção na Vercel
  'http://127.0.0.1:5500',         // Ambiente de desenvolvimento local
  'http://localhost:5500',
  'https://gerenciadortarefas-production.up.railway.app'         // Alternativa para desenvolvimento local
];

// Configuração do CORS para usar a lista de origens permitidas
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem 'origin' (ex: Postman) ou da nossa lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  },
  optionsSuccessStatus: 200 // Para compatibilidade com navegadores mais antigos
};

// 1. Aplica o middleware do CORS com as opções definidas.
app.use(cors(corsOptions));

// 2. Aplica o middleware para interpretar o corpo das requisições como JSON.
app.use(express.json());

// 3. Importa os diferentes roteadores da aplicação.
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const extraRoutes = require("./routes/extraRoutes");

// 4. Monta os roteadores no caminho base '/api'.
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", extraRoutes);

// 5. Configura a porta do servidor, usando a variável de ambiente se disponível.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});