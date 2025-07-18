const db = require('../../backend/db');
const ActivityLog = require('../../backend/models/ActivityLog');

describe('Integração - ActivityLog', () => {
  let userId;
  let taskId;

  beforeAll(async () => {
    await db.query(`DELETE FROM users WHERE email = 'logtest@email.com'`);
    const user = await db.query(`
      INSERT INTO users (name, email, password)
      VALUES ('Log Tester', 'logtest@email.com', '12345678')
      RETURNING id
    `);
    userId = user.rows[0].id;

    const task = await db.query(`
      INSERT INTO tasks (title, due_date, status, priority, user_id)
      VALUES ('Tarefa Log', '2025-07-20', 'pendente', 'alta', $1)
      RETURNING id
    `, [userId]);
    taskId = task.rows[0].id;
  });

  afterAll(async () => {
    await db.query(`DELETE FROM activity_logs WHERE task_id = $1`, [taskId]);
    await db.query(`DELETE FROM tasks WHERE id = $1`, [taskId]);
    await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await db.end();
  });

  test('deve criar um log de atividade válido', async () => {
    const log = await ActivityLog.create(taskId, userId, 'Log Tester', 'Criou a tarefa', 'Criou a tarefa');
    expect(log).toHaveProperty('id');
    expect(log.description).toBe('Criou a tarefa');
    expect(log.task_id).toBe(taskId);
    expect(log.user_id).toBe(userId);
    expect(log.user_name).toBe('Log Tester');
  });

  test('deve listar logs ordenados por data de criação', async () => {
    await ActivityLog.create(taskId, userId, 'Log Tester', 'Atualizou a tarefa', 'Atualizou a tarefa');

    const logs = await ActivityLog.findByTaskId(taskId);
    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThanOrEqual(2);
    expect(new Date(logs[0].created_at) >= new Date(logs[1].created_at)).toBe(true);
  });

  test('deve falhar com task_id inexistente', async () => {
    await expect(ActivityLog.create(99999, userId, 'Log Tester', 'Ação inválida', 'Ação inválida')).rejects.toThrow();
  });

  test('deve falhar com user_id inexistente', async () => {
    await expect(ActivityLog.create(taskId, 99999, 'Log Tester', 'Usuário inválido', 'Usuário inválido')).rejects.toThrow();
  });
});
