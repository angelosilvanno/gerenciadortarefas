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
    const { title } = req.body;
    const userId = req.user.id;

    const existingTask = await Task.findByTitle(userId, title);
    if (existingTask) {
      return res.status(409).json({ message: "Já existe uma tarefa com este título." });
    }

    const newTask = await Task.create(userId, req.body);
    const user = await User.findById(userId);
    const userName = user ? user.name : "Usuário desconhecido";

    await ActivityLog.create(
      newTask.id,
      userId,
      userName,
      "criação", 
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
    const { title } = req.body;

    if (title) {
      const existingTask = await Task.findByTitle(userId, title);
      if (existingTask && existingTask.id !== Number(taskId)) {
        return res.status(409).json({ message: "Já existe outra tarefa com este título." });
      }
    }

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
        "edição",
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
  console.log("🛠️ Entrou no deleteTask()");
  console.log("req.user.id:", req.user.id);
  console.log("req.params.id:", req.params.id);

  try {
    const deletedTask = await Task.delete(req.params.id, req.user.id);

    if (!deletedTask) {
      console.log("Nenhuma tarefa deletada. Provavelmente não pertence ao usuário.");
      return res.status(404).json({ message: "Tarefa não encontrada ou não pertence ao usuário" });
    }

    console.log("Tarefa deletada com sucesso!");
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao deletar tarefa:", err);
    res.status(500).json({ message: "Erro interno do servidor" });
  }
};


