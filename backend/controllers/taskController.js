const Task = require("../models/Task");

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    // O ID do usuário virá do middleware de autenticação que vamos criar
    const tasks = await Task.findByUserId(req.user.id); 
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Erro ao buscar tarefas:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.user.id, req.body);
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.update(req.params.id, req.user.id, req.body);
    if (!updatedTask) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence ao usuário" });
    }
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Erro ao atualizar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.delete(req.params.id, req.user.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence ao usuário" });
    }
    res.status(204).send(); // 204 No Content
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};