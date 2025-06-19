const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findByUserId(req.user.id);
    res.status(200).json(tasks);
  } catch (err) {
    console.error("Erro ao buscar tarefas:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const newTask = await Task.create(req.user.id, req.body);
    
    const user = await User.findById(req.user.id);
    const userName = user ? user.name : "Usuário desconhecido";
    
    await ActivityLog.create(
      newTask.id,
      req.user.id,
      userName,
      `criou a tarefa "${newTask.title}".`
    );

    res.status(201).json(newTask);
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const originalTask = await Task.findById(taskId);
    if (!originalTask || originalTask.user_id !== userId) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence ao usuário." });
    }

    const updatedTask = await Task.update(taskId, userId, req.body);
    if (!updatedTask) {
        return res.status(404).json({ message: "Falha ao atualizar a tarefa." });
    }

    const user = await User.findById(userId);
    const userName = user ? user.name : "Usuário desconhecido";
    const logMessages = [];

    if (originalTask.title !== updatedTask.title) {
      logMessages.push(`renomeou a tarefa de "${originalTask.title}" para "${updatedTask.title}".`);
    }
    if (originalTask.status !== updatedTask.status) {
      logMessages.push(`alterou o status de "${originalTask.status}" para "${updatedTask.status}".`);
    }
    if (String(originalTask.due_date) !== String(updatedTask.due_date)) {
        logMessages.push(`mudou a data de vencimento.`);
    }
    if (originalTask.priority !== updatedTask.priority) {
        logMessages.push(`alterou a prioridade para "${updatedTask.priority}".`);
    }

    if (logMessages.length > 0) {
      await ActivityLog.create(
        updatedTask.id,
        userId,
        userName,
        logMessages.join(" e ")
      );
    }
    
    res.status(200).json(updatedTask);
  } catch (err) {
    console.error("Erro ao atualizar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.delete(req.params.id, req.user.id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence ao usuário" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};