const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth.middleware'); 

router.get('/', authenticateToken, taskController.getTasks);
router.post('/', authenticateToken, taskController.createTask);
router.put('/:taskId', authenticateToken, taskController.updateTask);
router.delete('/:taskId', authenticateToken, taskController.deleteTask);

module.exports = router;