const db = require('../../backend/db');
const Comment = require('../../backend/models/Comment');
const Task = require('../../backend/models/Task');

describe('Model - Comment', () => {
  let userId;
  let taskId;
  let commentId;

  beforeAll(async () => {
    const timestamp = Date.now();

    const user = await db.query(`
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [`Comentador${timestamp}`, `comentador${timestamp}@email.com`, '123456']);
    userId = user.rows[0].id;

    const task = await Task.create(userId, {
      title: 'Tarefa para Comentário',
      description: 'Teste de comentários',
      due_date: '2025-12-31T23:59',
      priority: 'media',
      status: 'pendente',
      category: 'Teste',
      tags: ['comment'],
      reminder_minutes: 15
    });
    taskId = task.id;
  });

  afterAll(async () => {
    await db.query('DELETE FROM comments WHERE id = $1', [commentId]);
    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);
    await db.query('DELETE FROM users WHERE id = $1', [userId]);
    await db.end();
  });

  test('deve criar um comentário com sucesso', async () => {
    const comment = await Comment.create(taskId, userId, 'Comentário de teste');
    commentId = comment.id;
    expect(comment).toHaveProperty('id');
    expect(comment.text).toBe('Comentário de teste');
  });

  test('deve listar todos os comentários com info da tarefa e do usuário', async () => {
    const comments = await Comment.findByTaskId(taskId);
    expect(Array.isArray(comments)).toBe(true);
    expect(comments[0]).toHaveProperty('user_name');
    expect(comments[0]).toHaveProperty('created_at');
  });

  test('deve encontrar um comentário pelo ID', async () => {
    const newComment = await Comment.create(taskId, userId, 'Comentário de busca');
    const foundComment = await Comment.findById(newComment.id);
    expect(foundComment).toBeDefined();
    expect(foundComment.text).toBe('Comentário de busca');
  });
  
  test('deve remover um comentário com sucesso', async () => {
    const commentToDelete = await Comment.create(taskId, userId, 'Comentário a ser removido');
    await Comment.remove(commentToDelete.id);
    const deleted = await Comment.findById(commentToDelete.id);
    expect(deleted).toBeUndefined(); 
  });
  
});

