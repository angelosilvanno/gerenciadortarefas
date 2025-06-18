const pool = require("../db");

const User = {
  /**
   * @param {string} name - O nome do usuário.
   * @param {string} email - O e-mail do usuário.
   * @param {string} hashedPassword - A senha já processada com bcrypt.
   * @returns {Promise<object>} O objeto do novo usuário criado.
   */
  async create(name, email, hashedPassword) {
    try {
      const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hashedPassword]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Código de erro do PostgreSQL para violação de chave única
        if (error.constraint === 'users_name_key') {
          throw new Error('Este nome de usuário já está em uso.');
        }
        if (error.constraint === 'users_email_key') {
          throw new Error('Este e-mail já está em uso.');
        }
      }
      // Para outros erros, propaga o erro original
      throw error;
    }
  },

  /**
   * Encontra um usuário pelo seu ID.
   * @param {number} id - O ID do usuário.
   * @returns {Promise<object|undefined>} O objeto do usuário ou undefined se não for encontrado.
   */
  async findById(id) {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  /**
   * @param {string} email - O e-mail do usuário.
   * @returns {Promise<object|undefined>} O objeto do usuário ou undefined se não for encontrado.
   */
  async findByEmail(email) {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },
  
  /**
   * @param {string} identifier - O nome de usuário ou e-mail.
   * @returns {Promise<object|undefined>} O objeto completo do usuário (incluindo a senha) ou undefined.
   */
  async findByUsernameOrEmail(identifier) {
    const result = await pool.query(
      "SELECT id, name, email, password FROM users WHERE name = $1 OR email = $1",
      [identifier]
    );
    return result.rows[0];
  }
};

module.exports = User;