const ActivityLog = require("./models/ActivityLog");

// GET /api/tasks/:taskId/history
exports.getHistoryForTask = async (req, res) => {
  try {
    const history = await ActivityLog.findByTaskId(req.params.taskId);
    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ message: "Erro ao buscar histórico." });
  }
};