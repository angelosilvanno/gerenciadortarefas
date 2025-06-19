const express = require('express');
const router = express.Router();
const taskController = require('./controllers/taskController');
const authMiddleware = require('./middleware/authMiddleware');

// Rota para obter todas as tarefas do usuário autenticado.
router.get('/tasks', authMiddleware, taskController.getTasks);

// Rota para criar uma nova tarefa.
router.post('/tasks', authMiddleware, taskController.createTask);

// Rota para atualizar uma tarefa específica pelo seu ID.
router.put('/tasks/:id', authMiddleware, taskController.updateTask);

// Rota para deletar uma tarefa específica pelo seu ID.
router.delete('/tasks/:id', authMiddleware, taskController.deleteTask);

module.exports = router;