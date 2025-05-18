// db.js
const { Pool } = require('pg');
require('dotenv').config(); // Opcional: para carregar variáveis de ambiente

const pool = new Pool({
  user: process.env.DB_USER || 'postgres', // ex: 'postgres'
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'nextask_db',
  password: process.env.DB_PASSWORD || 'angelosilvano',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Testar a conexão (opcional, mas bom para feedback inicial)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao PostgreSQL:', err.stack);
  } else {
    console.log('Conectado ao PostgreSQL com sucesso em:', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Exporte o pool se precisar de funcionalidades mais avançadas como transações
};