const pool = require("../db");

const User = {
  async create(name, email, hashedPassword) { // Renomeado para hashedPassword para clareza
    try {
      const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      // Se o erro for de violação de constraint única (usuário ou email já existe)
      if (error.code === '23505') { 
        // A mensagem de erro do PostgreSQL dirá qual constraint foi violada
        if (error.constraint === 'users_name_key') {
            throw new Error('Este nome de usuário já está em uso.');
        }
        if (error.constraint === 'users_email_key') {
            throw new Error('Este e-mail já está em uso.');
        }
      }
      throw error; // Propaga outros erros
    }
  },

  // Função mais genérica que pode ser usada para login
  async findByUsernameOrEmail(username) {
    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE name = $1 OR email = $1",
      [username]
    );
    return result.rows[0];
  },
  
  // Função específica para checar o e-mail durante o cadastro
  async findByEmail(email) {
    const result = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  }
};

module.exports = User;