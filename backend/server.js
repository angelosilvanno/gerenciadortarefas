const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const app = express();

const allowedOrigins = [
  'http://127.0.0.1:5500', 
  'http://localhost:5500',  
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pela política de CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Importação dos arquivos de rota
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const extraRoutes = require("./routes/extraRoutes");

// Rotas públicas de autenticação
app.use("/api", authRoutes);
// Rotas protegidas de tarefas
app.use("/api", taskRoutes);
// Rotas protegidas para comentários e histórico
app.use("/api", extraRoutes);

// Configuração da porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});