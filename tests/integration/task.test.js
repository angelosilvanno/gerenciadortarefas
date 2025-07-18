const db = require('../../backend/db');
const Task = require('../../backend/models/Task');

describe('Integração - Task', () => {
  let userId;

  beforeAll(async () => {
    await db.query(`DELETE FROM users WHERE email = 'tasktest@email.com'`);
    const user = await db.query(`
      INSERT INTO users (name, email, password)
      VALUES ('Task Tester', 'tasktest@email.com', '12345678')
      RETURNING id
    `);
    userId = user.rows[0].id;
  });

  afterAll(async () => {
    await db.query(`DELETE FROM tasks WHERE user_id = $1`, [userId]);
    await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
    await db.end();
  });

  test('deve criar uma tarefa com dados válidos', async () => {
    const task = await Task.create(userId, {
      title: 'Tarefa Teste',
      description: 'Descrição de teste',
      due_date: '2025-07-30T12:00',
      priority: 'media',
      status: 'pendente',
      category: 'Estudos',
      tags: ['teste', 'integração'], 
      reminder_minutes: 15
    });
    expect(task).toHaveProperty('id');
    expect(task.user_id).toBe(userId);
    expect(task.title).toBe('Tarefa Teste');
  });

  test('deve falhar ao criar tarefa com data no passado', async () => {
    await expect(Task.create(userId, {
      title: 'Data Passada',
      description: 'Descrição',
      due_date: '2000-01-01T00:00',
      priority: 'baixa',
      status: 'pendente',
      category: 'Erro',
      tags: ['erro'],
      reminder_minutes: 15
    })).rejects.toThrow();
  });

  test('deve falhar ao criar tarefa com prioridade inválida', async () => {
    await expect(Task.create(userId, {
      title: 'Prioridade Inválida',
      description: 'Descrição',
      due_date: '2025-07-30T12:00',
      priority: 'urgente',
      status: 'pendente',
      category: 'Erro',
      tags: ['prioridade'],
      reminder_minutes: 15
    })).rejects.toThrow();
  });

  test('deve falhar ao criar tarefa com lembrete inválido', async () => {
    await expect(Task.create(userId, {
      title: 'Lembrete Inválido',
      description: 'Descrição',
      due_date: '2025-07-30T12:00',
      priority: 'baixa',
      status: 'pendente',
      category: 'Erro',
      tags: ['lembrete'],
      reminder_minutes: 999
    })).rejects.toThrow();
  });

  test('deve criar tarefa com status e categoria válidos', async () => {
    const task = await Task.create(userId, {
      title: 'Com Status e Categoria',
      description: 'Descrição',
      due_date: '2025-07-30T12:00',
      priority: 'alta',
      status: 'concluida',
      category: 'Trabalho',
      tags: ['tag1', 'tag2'], 
      reminder_minutes: 30
    });
    expect(task.status).toBe('concluida');
    expect(task.category).toBe('Trabalho');
  });
});
