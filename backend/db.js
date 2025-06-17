const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "taskmanager",
  password: "angelosilvano",
  port: 5432
});

module.exports = pool;
