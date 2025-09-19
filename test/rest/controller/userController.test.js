const request = require('supertest');
const sinon = require('sinon');
const {expect} = require('chai');

const app = require('../../../rest/app');

describe('User Controller', () => {
    describe('POST /api/users/register', () => {
        it('Deve retornar 201 quando o registro do usuário for realizado com sucesso', async () => {
            const userData = {
                name: "Julia",
                email: "julia@gmail.com",
                password: "123456"
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(userData);

            expect(response.status).to.equal(201);
            expect(response.body.user).to.have.property('name', userData.name);
            expect(response.body.user).to.have.property('email', userData.email);
        });

        it('Deve retornar 400 quando o e-mail já estiver cadastrado', async () => {
            const userData = {
                name: "Alice",
                email: "alice@email.com",
                password: "123456"
            };

            const response = await request(app)
                .post('/api/users/register')
                .send(userData);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error', 'Email já cadastrado');
        });

    });    

    describe('POST /api/users/login', () => {
        it('Deve retornar 200 quando o login for realizado com sucesso', async () => {
            const userData = {
                name: 'Alice',
                email: 'alice@email.com',
                password: '123456'
            };

            const response = await request(app)
                .post('/api/users/login')
                .send(userData);
                
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('token');
        });

        it('Deve retornar 401 quando as credenciais estiverem incorretas', async () => {
            const userData = {
                email: "joaa@gmail.com",
                password: "12345911111"
            };

            const response = await request(app)
                .post('/api/users/login')
                .send(userData);

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('error', 'Credenciais inválidas');
        });
    });
});
