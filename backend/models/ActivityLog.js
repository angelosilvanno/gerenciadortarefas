const pool = require("../db");

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

  async create(taskId, userId, userName, action, description) {
    const query = `
      INSERT INTO activity_logs (task_id, user_id, user_name, action, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [taskId, userId, userName, action, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
};

module.exports = ActivityLog;