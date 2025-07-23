const pool = require("../db");

function padronizarPrioridade(priority) {
  if (!priority) return 'media';
  const prioridadeNormalizada = priority.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const prioridadesValidas = ['baixa', 'media', 'alta'];
  if (!prioridadesValidas.includes(prioridadeNormalizada)) {
    throw new Error(`Prioridade inválida: '${priority}'`);
  }
  return prioridadeNormalizada;
}

function padronizarStatus(status) {
  if (!status) return 'pendente';
  const statusNormalizado = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const statusValidos = ['pendente', 'em andamento', 'concluida'];
  if (!statusValidos.includes(statusNormalizado)) {
    throw new Error(`Status inválido: '${status}'`);
  }
  return statusNormalizado;
}

const Task = {
  async create(userId, taskData) {
    const {
      title, description, due_date, priority, status,
      category, date_time, reminder_minutes, fixed = false
    } = taskData;

    if (due_date) {
      const hojeDate = new Date();
      const ano = hojeDate.getFullYear();
      const mes = String(hojeDate.getMonth() + 1).padStart(2, '0');
      const dia = String(hojeDate.getDate()).padStart(2, '0');
      const hojeString = `${ano}-${mes}-${dia}`;
      if (due_date < hojeString) {
        throw new Error('A data de vencimento não pode estar no passado');
      }
    }
  
    const prioridadeFinal = padronizarPrioridade(priority);
    const statusFinal = padronizarStatus(status);
    
    const lembretesValidos = [15, 30];
    if (reminder_minutes && !lembretesValidos.includes(Number(reminder_minutes))) {
      throw new Error('Lembrete inválido');
    }
  
    const result = await pool.query(
      `INSERT INTO tasks 
        (user_id, title, description, due_date, priority, status, category, date_time, reminder_minutes, fixed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, title, description, due_date, prioridadeFinal, statusFinal, category, date_time, reminder_minutes, fixed]
    );
  
    return result.rows[0];
  },

  async update(taskId, userId, updateData) {
    if (updateData.priority) {
      updateData.priority = padronizarPrioridade(updateData.priority);
    }
    if (updateData.status) {
      updateData.status = padronizarStatus(updateData.status);
    }
    
    const keys = Object.keys(updateData);
    if (keys.length === 0) {
      const res = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [taskId, userId]);
      return res.rows[0];
    }

    const fields = keys.map((key, index) => `"${key}" = $${index + 3}`).join(', ');
    const values = Object.values(updateData);
    const query = `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *`;
    
    const result = await pool.query(query, [taskId, userId, ...values]);
    return result.rows[0];
  },

  async delete(taskId, userId) {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
      [Number(taskId), Number(userId)]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1 ORDER BY fixed DESC, due_date ASC`,
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
    const result = await pool.query(
      'SELECT id FROM tasks WHERE user_id = $1 AND title = $2',
      [userId, title]
    );
    return result.rows[0];
  },
};

module.exports = Task;