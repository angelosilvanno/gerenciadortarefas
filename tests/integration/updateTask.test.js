const request = require('supertest');
const app = require('../../backend/app');
const db = require('../../backend/db');
const jwt = require('jsonwebtoken');

describe('Integração - Editar Tarefa', () => {
    let token;
    let tarefaCriada;
    let userId;

    beforeAll(async () => {
        await db.query(`DELETE FROM users WHERE email = 'edita@email.com'`);

        const user = await db.query(`
            INSERT INTO users (name, email, password)
            VALUES ('Editor', 'edita@email.com', '123456')
            RETURNING id
        `);
        userId = user.rows[0].id;

        token = jwt.sign({ id: userId, name: 'Editor' }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        const resultado = await db.query(`
            INSERT INTO tasks (title, due_date, status, priority, user_id)
            VALUES ('Tarefa Original', '2025-07-01', 'pendente', 'baixa', $1)
            RETURNING id;
        `, [userId]);
        tarefaCriada = resultado.rows[0];
    });

    afterAll(async () => {
        await db.query('DELETE FROM tasks WHERE user_id = $1', [userId]);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
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

