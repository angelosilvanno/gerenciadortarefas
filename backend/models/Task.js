const pool = require("../db");

const Task = {
  async create(userId, taskData) {
    const { title, description, due_date, priority, status, category, date_time, reminder_minutes } = taskData;
  
    const result = await pool.query(
      `INSERT INTO tasks 
        (user_id, title, description, due_date, priority, status, category, date_time, reminder_minutes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
      [userId, title, description, due_date, priority, status, category, date_time, reminder_minutes]
    );
  
    return result.rows[0];
  },
  
  async findByUserId(userId) {
    const result = await pool.query(
    "SELECT id, user_id, title, description, due_date, priority, status, category, date_time, reminder_minutes FROM tasks WHERE user_id = $1 ORDER BY due_date ASC, created_at DESC",
      [userId]
    );
    return result.rows;
  },

  async findById(taskId) {
    const result = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [taskId]
    );
    return result.rows[0];
  },

  async update(taskId, userId, updateData) {
    const fields = Object.keys(updateData).map((key, index) => `"${key}" = $${index + 3}`).join(', ');
    const values = Object.values(updateData);

    const query = `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *`;
    
    const result = await pool.query(query, [taskId, userId, ...values]);
    return result.rows[0];
  },

  async delete(taskId, userId) {
    console.log("🔍 Task.delete() recebeu:", {
      taskId,
      userId,
      tipos: {
        taskId: typeof taskId,
        userId: typeof userId
      }
    });
  
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, user_id",
      [Number(taskId), Number(userId)]
    );
  
    console.log("Resultado do DELETE:", result.rows);
  
    return result.rows[0];
  },
};

module.exports = Task;
