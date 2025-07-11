const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const activityLogController = require('../controllers/activityLogController');
const authMiddleware = require('../middleware/authMiddleware');

// Protege todas estas rotas
router.use(authMiddleware);

// Rotas de Comentários
router.get('/tasks/:taskId/comments', commentController.getCommentsForTask);
router.post('/tasks/:taskId/comments', commentController.addCommentToTask);
router.delete('/tasks/:taskId/comments/:commentId', commentController.deleteComment);

// Rota de Histórico
router.get('/tasks/:taskId/history', activityLogController.getHistoryForTask);

module.exports = router;