const request = require('supertest');
const app = require('../../backend/app'); 
const jwt = require('jsonwebtoken');

describe('Integração - Criar Tarefa', () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({ id: 1, name: 'Usuário Teste' }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
    });
    
    it('deve criar uma nova tarefa com sucesso', async () => {
        const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
            title: 'Tarefa Teste',
            due_date: '2025-06-25',
            status: 'pendente',
            priority: 'alta'
        });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Tarefa Teste');
    });
});