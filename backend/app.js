const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require("express");
const cors = require("cors");
const app = express();

const allowedOrigins = [
  'https://nexttaskweb.vercel.app',
  'http://127.0.0.1:5500',
  'http://localhost:5500',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pela política de CORS'));
    }
  },
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const extraRoutes = require("./routes/extraRoutes");

app.use("/api", authRoutes);
app.use("/api", taskRoutes);
app.use("/api", extraRoutes);

module.exports = app;
