const Comment = require("./models/Comment");

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