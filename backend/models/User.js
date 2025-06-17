const pool = require("../db");

const User = {
  async create(name, email, password) {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
      [name, email, password]
    );
    return result.rows[0];
  },

  async findByUsername(name) {
    const result = await pool.query(
      "SELECT id, name, password FROM users WHERE name = $1",
      [name]
    );
    return result.rows[0];
  }
};

module.exports = User;
