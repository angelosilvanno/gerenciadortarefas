const express = require("express");
const cors = require("cors");
const app = express();

// --- INÍCIO DA MUDANÇA ---

// Configurações do CORS
const corsOptions = {
  origin: 'http://127.0.0.1:5500', // Permite requisições SOMENTE desta origem
  optionsSuccessStatus: 200 // Para navegadores mais antigos
};

app.use(cors(corsOptions)); // Usa as opções que definimos

// --- FIM DA MUDANÇA ---

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});