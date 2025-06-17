const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
