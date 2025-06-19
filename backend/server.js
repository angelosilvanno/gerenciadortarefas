const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());

// 3. Importa os arquivos de rota.
const authRoutes = require("../routes/authRoutes");
const taskRoutes = require("../routes/taskRoutes");
const extraRoutes = require("../routes/extraRoutes");

// 4. Associa os roteadores aos seus caminhos base.
app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", extraRoutes);

// 5. Configura a porta e inicia o servidor.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});