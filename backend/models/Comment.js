const pool = require("../db");

const Comment = {
  async findByTaskId(taskId) {
    const query = `
      SELECT c.id, c.text, c.created_at, c.user_id, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [taskId]);
    return result.rows;
  },

  async findById(commentId) {
    const query = 'SELECT * FROM comments WHERE id = $1';
    const result = await pool.query(query, [commentId]);
    return result.rows[0];
  },

  async create(taskId, userId, text) {
    const query = `
      INSERT INTO comments (task_id, user_id, text)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [taskId, userId, text]);
    return result.rows[0];
  },

  async remove(commentId) {
    const query = 'DELETE FROM comments WHERE id = $1';
    await pool.query(query, [commentId]);
  },
};

module.exports = Comment;
