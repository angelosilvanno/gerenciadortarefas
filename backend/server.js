const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log(`[Diagnóstico] JWT_SECRET: ${process.env.JWT_SECRET}`);

const express = require("express");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});