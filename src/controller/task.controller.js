const db = require('../config/db'); 

async function getTasks(req, res) {
  const userId = req.user?.id; 

  if (!userId) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  try {
    const result = await db.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC, created_at ASC', [userId]);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar tarefas:', err);
    res.status(500).json({ message: 'Erro interno do servidor ao buscar tarefas.' });
  }
}

async function createTask(req, res) {
  const userId = req.user?.id;
  const { title, description, dueDate, priority, status, category, tags } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Não autorizado." });
  }
  if (!title || !dueDate) {
    return res.status(400).json({ message: "Título e Prazo são obrigatórios." });
  }

  try {
    const newTaskQuery = await db.query(
      'INSERT INTO tasks (user_id, title, description, due_date, priority, status, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, title, description || null, dueDate, priority || 'média', status || 'pendente', category || null]
    );
    const newTask = newTaskQuery.rows[0];

    if (tags && Array.isArray(tags) && tags.length > 0) {
        console.log("Lógica de tags a ser implementada para a tarefa:", newTask.id);
    }


    res.status(201).json(newTask);
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    if (err.constraint === 'tasks_priority_check' || err.constraint === 'tasks_status_check') { 
        return res.status(400).json({ message: 'Valor inválido para prioridade ou status.' });
    }
    res.status(500).json({ message: 'Erro interno do servidor ao criar tarefa.' });
  }
}

async function updateTask(req, res) {
  const userId = req.user?.id;
  const taskId = parseInt(req.params.taskId, 10);
  const { title, description, dueDate, priority, status, category, tags } = req.body;

  if (!userId) {
    return res.status(401).json({ message: "Não autorizado." });
  }
  if (isNaN(taskId)) {
    return res.status(400).json({ message: "ID da tarefa inválido." });
  }

  try {
    const checkTask = await db.query('SELECT user_id FROM tasks WHERE id = $1', [taskId]);
    if (checkTask.rows.length === 0) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
    }
    if (checkTask.rows[0].user_id !== userId) {
        return res.status(403).json({ message: "Acesso negado a esta tarefa." });
    }

    const updatedTaskQuery = await db.query(
      `UPDATE tasks SET 
        title = COALESCE($1, title), 
        description = COALESCE($2, description), 
        due_date = COALESCE($3, due_date), 
        priority = COALESCE($4, priority), 
        status = COALESCE($5, status), 
        category = COALESCE($6, category),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title, description, dueDate, priority, status, category, taskId, userId]
    );

    if (updatedTaskQuery.rows.length === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pôde ser atualizada." });
    }

    // Lógica para atualizar tags (remover antigas, adicionar novas) - complexa

    res.status(200).json(updatedTaskQuery.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
    res.status(500).json({ message: 'Erro interno do servidor ao atualizar tarefa.' });
  }
}

async function deleteTask(req, res) {
  const userId = req.user?.id;
  const taskId = parseInt(req.params.taskId, 10);

  if (!userId) {
    return res.status(401).json({ message: "Não autorizado." });
  }
  if (isNaN(taskId)) {
    return res.status(400).json({ message: "ID da tarefa inválido." });
  }

  try {
    const checkTask = await db.query('SELECT user_id FROM tasks WHERE id = $1', [taskId]);
    if (checkTask.rows.length === 0) {
        return res.status(404).json({ message: "Tarefa não encontrada." });
    }
    if (checkTask.rows[0].user_id !== userId) {
        return res.status(403).json({ message: "Acesso negado a esta tarefa." });
    }

    const result = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [taskId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pôde ser excluída." });
    }

    res.status(200).json({ message: "Tarefa excluída com sucesso.", id: result.rows[0].id });
  } catch (err) {
    console.error('Erro ao excluir tarefa:', err);
    res.status(500).json({ message: 'Erro interno do servidor ao excluir tarefa.' });
  }
}

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};