const db = require('../../backend/db');
const Task = require('../../backend/models/Task');

describe('Integração - Task', () => {
  let userId;
  let createdTaskId;

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
    createdTaskId = task.id;
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

  test('deve encontrar uma tarefa pelo ID', async () => {
    const found = await Task.findById(createdTaskId);
    expect(found).toBeDefined();
    expect(found.id).toBe(createdTaskId);
    expect(found.title).toBe('Tarefa Teste');
  });

  test('deve encontrar uma tarefa pelo título do usuário', async () => {
    const found = await Task.findByTitle(userId, 'Tarefa Teste');
    expect(found).toBeDefined();
    expect(found.id).toBe(createdTaskId);
  });

  test('deve atualizar uma tarefa existente', async () => {
    const updated = await Task.update(createdTaskId, userId, {
      title: 'Atualizada',
      priority: 'media'
    });
    expect(updated).toBeDefined();
    expect(updated.title).toBe('Atualizada');
    expect(updated.priority).toBe('media');
  });

  test('deve deletar uma tarefa existente', async () => {
    const deleted = await Task.delete(createdTaskId, userId);
    expect(deleted).toBeDefined();
    expect(deleted.id).toBe(createdTaskId);

    const afterDelete = await Task.findById(createdTaskId);
    expect(afterDelete).toBeUndefined();
  });

  test('deve retornar todas as tarefas do usuário com findByUserId', async () => {
    await Task.create(userId, {
      title: 'Tarefa 1',
      description: 'Descrição 1',
      due_date: '2025-07-30T12:00',
      priority: 'media',
      status: 'pendente',
      category: 'Estudos',
      reminder_minutes: 15
    });

    await Task.create(userId, {
      title: 'Tarefa 2',
      description: 'Descrição 2',
      due_date: '2025-07-31T12:00',
      priority: 'baixa',
      status: 'pendente',
      category: 'Trabalho',
      reminder_minutes: 30
    });

    const tasks = await Task.findByUserId(userId);
    expect(tasks.length).toBeGreaterThanOrEqual(2);
    expect(tasks[0]).toHaveProperty('title');
    expect(tasks[0]).toHaveProperty('due_date');
  });

  test('deve manter a tarefa inalterada se updateData estiver vazio', async () => {
    const task = await Task.create(userId, {
      title: 'Tarefa Original',
      description: 'Nada muda',
      due_date: '2025-08-01T12:00',
      priority: 'baixa',
      status: 'pendente',
      category: 'Estudos',
      reminder_minutes: 15
    });

    const updated = await Task.update(task.id, userId, {});
    expect(updated.id).toBe(task.id); 
  });

  test('deve retornar undefined ao deletar tarefa inexistente', async () => {
    const result = await Task.delete(9999999, userId); 
    expect(result).toBeUndefined();
  });

});

