const request = require('supertest');
const app = require('../../backend/app');
const db = require('../../backend/db');
const jwt = require('jsonwebtoken');

describe('Integração - Editar Tarefa', () => {
    let token;
    let tarefaCriada;

    beforeAll(async () => {
        token = jwt.sign({ id: 1, name: 'Usuário Teste' }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        const resultado = await db.query(`
            INSERT INTO tasks (title, due_date, status, priority, user_id)
            VALUES ('Tarefa Original', '2025-07-01', 'pendente', 'baixa', 1)
            RETURNING id;
        `);
        tarefaCriada = resultado.rows[0];
    });

    afterAll(async () => {
        await db.query('DELETE FROM tasks WHERE title = $1', ['Tarefa Editada']);
        await db.query('DELETE FROM tasks WHERE title = $1', ['Tarefa Original']);
        await db.end();
    });

    it('deve editar uma tarefa existente com sucesso', async () => {
        const response = await request(app)
            .put(`/api/tasks/${tarefaCriada.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Tarefa Editada',
                due_date: '2025-07-05',
                status: 'concluída',
                priority: 'alta',
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe('Tarefa Editada');
        expect(response.body.status).toBe('concluída');
    });
});
