require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

const cors = require('cors');

const corsOptions = {
  origin: 'https://nextask-app.onrender.com'
};
app.use(cors(corsOptions));