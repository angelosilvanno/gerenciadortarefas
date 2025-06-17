const pool = require("../db");

const Comment = {
  async findByTaskId(taskId) {
    const query = `
      SELECT c.id, c.content, c.created_at, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.task_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [taskId]);
    return result.rows;
  },

  async create(taskId, userId, content) {
    const query = `
      INSERT INTO comments (task_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [taskId, userId, content]);
    return result.rows[0];
  }
};

module.exports = Comment;