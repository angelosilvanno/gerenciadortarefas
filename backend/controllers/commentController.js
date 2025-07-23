const Comment = require("../models/Comment");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

exports.getCommentsForTask = async (req, res) => {
  try {
    const comments = await Comment.findByTaskId(req.params.taskId);
    res.status(200).json(comments);
  } catch (err) {
    console.error("Erro ao buscar comentários:", err);
    res.status(500).json({ message: "Erro ao buscar comentários." });
  }
};

exports.addCommentToTask = async (req, res) => {
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ message: "O conteúdo do comentário é obrigatório." });
  }

  try {
    const newComment = await Comment.create(req.params.taskId, req.user.id, content);
    
    const user = await User.findById(req.user.id);
    const userName = user ? user.name : "Usuário desconhecido";
    
    await ActivityLog.create(
      req.params.taskId,
      req.user.id,
      userName,
      "comentario",
      `adicionou o comentário: "${content.substring(0, 30)}..."`
    );

    res.status(201).json(newComment);
  } catch (err) {
    console.error("Erro ao adicionar comentário:", err);
    res.status(500).json({ message: "Erro ao adicionar comentário." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ message: "Acesso negado." });
    }
    
    const deletedComment = await Comment.remove(commentId);
    if (!deletedComment) {
      return res.status(404).json({ message: "Comentário não encontrado." });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao excluir comentário:", err);
    res.status(500).json({ message: "Erro ao excluir comentário." });
  }
};