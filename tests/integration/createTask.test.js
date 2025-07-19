const request = require('supertest');
const app = require('../../backend/app');
const db = require('../../backend/db');
const jwt = require('jsonwebtoken');

describe('Integração - Criar Tarefa', () => {
    let token;
    let userId;

    beforeAll(async () => {
        await db.query(`DELETE FROM users WHERE email = 'testetarefa@email.com'`);

        const user = await db.query(`
            INSERT INTO users (name, email, password)
            VALUES ('Usuário Teste', 'testetarefa@email.com', '123456')
            RETURNING id
        `);
        userId = user.rows[0].id;

        token = jwt.sign({ id: userId, name: 'Usuário Teste' }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
    });

    afterAll(async () => {
        await db.query('DELETE FROM tasks WHERE title = $1', ['Tarefa Teste']);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        await db.end();
    });

    it('deve criar uma nova tarefa com sucesso', async () => {
        const response = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .send({
                title: 'Tarefa Teste',
                due_date: '2099-12-31T12:00',
                status: 'pendente',
                priority: 'alta'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Tarefa Teste');
    });
});
