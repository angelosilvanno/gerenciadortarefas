const Comment = require("../models/Comment");

// GET /api/tasks/:taskId/comments
exports.getCommentsForTask = async (req, res) => {
  try {
    const comments = await Comment.findByTaskId(req.params.taskId);
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar comentários." });
  }
};

// POST /api/tasks/:taskId/comments
exports.addCommentToTask = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: "O conteúdo do comentário é obrigatório." });

  try {
    const newComment = await Comment.create(req.params.taskId, req.user.id, content);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ message: "Erro ao adicionar comentário." });
  }
};

// DELETE /api/tasks/:taskId/comments/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado. Você só pode excluir seus próprios comentários." });
    }

    await Comment.remove(commentId);
    res.status(204).send();

  } catch (err) {
    res.status(500).json({ message: "Erro ao excluir comentário." });
  }
};