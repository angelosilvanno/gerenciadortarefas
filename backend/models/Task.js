const pool = require("../db");

const Task = {
  async create(userId, taskData) {
    const {
      title,
      description,
      due_date,
      priority,
      status,
      category,
      date_time,
      reminder_minutes
    } = taskData;

    if (due_date) {
      const hoje = new Date().toISOString().split('T')[0];

      if (due_date < hoje) {
        throw new Error('A data de vencimento não pode estar no passado');
      }
    }

    const prioridadeNormalizada = priority?.toLowerCase()?.normalize("NFD").replace(/[\u0300-\u036f]/g, '');
    const prioridadesMapeadas = {
      baixa: 'baixa',
      media: 'média',
      alta: 'alta'
    };

    if (!prioridadesMapeadas[prioridadeNormalizada]) {
      throw new Error('Prioridade inválida');
    }

    const prioridadeFinal = prioridadesMapeadas[prioridadeNormalizada];

    const lembretesValidos = [15, 30];
    if (reminder_minutes && !lembretesValidos.includes(reminder_minutes)) {
      throw new Error('Lembrete inválido');
    }

    const result = await pool.query(
      `INSERT INTO tasks 
        (user_id, title, description, due_date, priority, status, category, date_time, reminder_minutes) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
      [userId, title, description, due_date, prioridadeFinal, status, category, date_time, reminder_minutes]
    );

    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT id, user_id, title, description, due_date, priority, status, category, date_time, reminder_minutes 
       FROM tasks 
       WHERE user_id = $1 
       ORDER BY due_date ASC`,
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

  async findByTitle(userId, title) {
    const query = 'SELECT id FROM tasks WHERE user_id = $1 AND title = $2';
    const result = await pool.query(query, [userId, title]);
    return result.rows[0];
  },

  async update(taskId, userId, updateData) {
    const keys = Object.keys(updateData);

    if (keys.length === 0) {
      const result = await pool.query(
        'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
        [taskId, userId]
      );
      return result.rows[0];
    }

    const fields = keys.map((key, index) => `"${key}" = $${index + 3}`).join(', ');
    const values = Object.values(updateData);

    const query = `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *`;
    
    const result = await pool.query(query, [taskId, userId, ...values]);
    return result.rows[0];
  },

  async delete(taskId, userId) {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id, user_id",
      [Number(taskId), Number(userId)]
    );

    return result.rows[0];
  },
};

module.exports = Task;

