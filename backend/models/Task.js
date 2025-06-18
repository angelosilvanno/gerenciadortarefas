const pool = require("../db");

const Task = {
  /**
   * Cria uma nova tarefa para um usuário específico.
   * @param {number} userId - O ID do usuário dono da tarefa.
   * @param {object} taskData - O objeto contendo os dados da tarefa.
   * @returns {Promise<object>} O objeto da nova tarefa criada.
   */
  async create(userId, taskData) {
    const { title, description, due_date, priority, status, category, tags } = taskData;
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, due_date, priority, status, category, tags) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, title, description, due_date, priority, status, category, tags]
    );
    return result.rows[0];
  },

  /**
   * Encontra todas as tarefas de um usuário específico.
   * @param {number} userId - O ID do usuário.
   * @returns {Promise<Array<object>>} Um array com as tarefas do usuário.
   */
  async findByUserId(userId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC, created_at DESC",
      [userId]
    );
    return result.rows;
  },

  /**
   * Encontra uma tarefa específica pelo seu ID.
   * @param {number} taskId - O ID da tarefa a ser encontrada.
   * @returns {Promise<object|undefined>} O objeto da tarefa ou undefined se não for encontrada.
   */
  async findById(taskId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );
    return result.rows[0];
  },

  /**
   * Atualiza uma tarefa existente.
   * @param {number} taskId - O ID da tarefa a ser atualizada.
   * @param {number} userId - O ID do usuário (para segurança, garantindo que ele é o dono).
   * @param {object} updateData - Um objeto com os campos a serem atualizados.
   * @returns {Promise<object|undefined>} O objeto da tarefa atualizada.
   */
  async update(taskId, userId, updateData) {
    // Converte os nomes de camelCase (JavaScript) para snake_case (banco de dados), se necessário.
    // Neste caso, nosso front-end já envia snake_case, então a chave é garantir consistência.
    const fields = Object.keys(updateData).map((key, index) => `"${key}" = $${index + 3}`).join(', ');
    const values = Object.values(updateData);

    const query = `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *`;
    
    const result = await pool.query(query, [taskId, userId, ...values]);
    return result.rows[0];
  },

  /**
   * Deleta uma tarefa específica.
   * @param {number} taskId - O ID da tarefa a ser deletada.
   * @param {number} userId - O ID do usuário dono da tarefa.
   * @returns {Promise<object|undefined>} O objeto com o ID da tarefa deletada.
   */
  async delete(taskId, userId) {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [taskId, userId]
    );
    return result.rows[0];
  }
};

module.exports = Task;