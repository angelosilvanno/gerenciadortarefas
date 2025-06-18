const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

console.log(`[Diagnóstico] JWT_SECRET: ${process.env.JWT_SECRET}`);

const express = require("express");
const cors = require("cors");
const app = express();

const corsOptions = {
  origin: [
    'https://nexttaskdev.netlify.app', 
    'http://127.0.0.1:5500'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const extraRoutes = require("./routes/extraRoutes");

app.use("/api", taskRoutes);
app.use("/api", authRoutes);
app.use("/api", extraRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});