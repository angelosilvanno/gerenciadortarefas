const db = require('../../backend/db');

describe('Integração - Comentários', () => {
  let taskId;
  let userId;

  beforeAll(async () => {
    await db.query(`DELETE FROM users WHERE email = 'comentador@email.com'`);

    const user = await db.query(`
      INSERT INTO users (name, email, password)
      VALUES ('Comentador', 'comentador@email.com', '12345678')
      RETURNING id
    `);
    userId = user.rows[0].id;

    const task = await db.query(`
      INSERT INTO tasks (title, due_date, status, priority, user_id)
      VALUES ('Tarefa para Comentário', '2025-07-01', 'pendente', 'média', $1)
      RETURNING id
    `, [userId]);
    taskId = task.rows[0].id;
  });

  afterAll(async () => {
    await db.query(`DELETE FROM comments WHERE task_id = $1`, [taskId]);
    await db.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
    await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await db.end();
  });

  test('deve criar um comentário válido', async () => {
    const result = await db.query(`
      INSERT INTO comments (text, task_id, user_id)
      VALUES ('Comentário de integração', $1, $2)
      RETURNING *;
    `, [taskId, userId]);

    expect(result.rows[0]).toHaveProperty('id');
    expect(result.rows[0].text).toBe('Comentário de integração');
  });

  test('deve falhar ao criar comentário sem texto', async () => {
    await expect(db.query(`
      INSERT INTO comments (task_id, user_id)
      VALUES ($1, $2);
    `, [taskId, userId])).rejects.toThrow();
  });

  test('deve falhar com task_id inexistente', async () => {
    await expect(db.query(`
      INSERT INTO comments (text, task_id, user_id)
      VALUES ('Comentário inválido', 9999, $1);
    `, [userId])).rejects.toThrow();
  });

  test('deve falhar com user_id inexistente', async () => {
    await expect(db.query(`
      INSERT INTO comments (text, task_id, user_id)
      VALUES ('Comentário inválido', $1, 9999);
    `, [taskId])).rejects.toThrow();
  });

  test('deve retornar comentário com dados do usuário e da tarefa', async () => {
    const result = await db.query(`
      SELECT comments.*, users.name AS user_name, tasks.title AS task_title
      FROM comments
      JOIN users ON comments.user_id = users.id
      JOIN tasks ON comments.task_id = tasks.id
      WHERE comments.task_id = $1;
    `, [taskId]);

    if (result.rows.length > 0) {
      expect(result.rows[0]).toHaveProperty('user_name');
      expect(result.rows[0]).toHaveProperty('task_title');
    }
  });
});

  