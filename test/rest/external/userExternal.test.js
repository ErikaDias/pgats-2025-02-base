const request = require('supertest');
const {expect} = require('chai');

describe('User Controller', () => {
    describe('POST /api/users/register', () => {
        it('Deve retornar 201 quando o usuário for registrado com sucesso', async () => {
            const userData = {
                name: 'jonas',
                email: `jonas_${Date.now()}@gmail.com`,
                password: '123456'
            };

            const response = await request('http://localhost:3000')
                .post('/api/users/register')
                .send(userData);

            expect(response.status).to.equal(201);
            expect(response.body.user).to.have.property('name', userData.name);
            expect(response.body.user).to.have.property('email', userData.email);
  
        });

        it('Deve retornar 400 quando o e-mail já estiver cadastrado', async () => {
            const userData = {
                name: 'Alice',
                email: 'alice@email.com',
                password: '123456'
            };

            const response = await request('http://localhost:3000')
                .post('/api/users/register')
                .send(userData);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error', 'Email já cadastrado');
        });
    });    
}); 