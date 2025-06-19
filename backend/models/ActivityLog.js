const pool = require("./db");

const ActivityLog = {
  async findByTaskId(taskId) {
    const query = `
      SELECT id, description, user_name, created_at
      FROM activity_logs
      WHERE task_id = $1
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [taskId]);
    return result.rows;
  },

  async create(taskId, userId, userName, description) {
    const query = `
      INSERT INTO activity_logs (task_id, user_id, user_name, description)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [taskId, userId, userName, description]);
    return result.rows[0];
  }
};

module.exports = ActivityLog;