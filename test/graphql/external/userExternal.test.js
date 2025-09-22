const request = require('supertest');
const {expect} = require('chai');

describe('User External', () => {

    describe('GraphQL API Register', () => {
        it('Deve registrar o usuário com sucesso', async () => {
            let email = `jonas_${Date.now()}@gmail.com`
            const response = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                    query: `
                        mutation Register($name: String!, $email: String!, $password: String!) {
                            register(name: $name, email: $email, password: $password) {
                                email
                                name
                        }
                    }`,
                    variables: {
                        name: 'jonas',
                        email: `${email}`,
                        password: 'senha123'
                    }
                });

                expect(response.body).to.have.nested.property('data.register.email', `${email}`);
                expect(response.body).to.have.nested.property('data.register.name', 'jonas');
        });

        it('Deve retornar erro ao tentar registrar usuário com email já cadastrado', async () => {
            const response = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                    query: `
                        mutation Register($name: String!, $email: String!, $password: String!) {
                            register(name: $name, email: $email, password: $password) {
                                email
                                name
                        }
                    }`,
                    variables: {
                        name: 'Alice',
                        email: `alice@email.com`,
                        password: 'senha123'
                    }
                });

                expect(response.body.errors[0].message).to.equal("Email já cadastrado");
        
        });

    });

    describe('GraphQL API Login', () => {

        it('Deve realizar login com sucesso', async () => {
            const response = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                    query: `
                        mutation Login($email: String!, $password: String!) {
                            login(email: $email, password: $password) {
                                token
                        }
                    }`,
                    variables: {
                        email: 'alice@email.com',
                        password: '123456'
                    }
                });

                expect(response.body).to.have.nested.property('data.login.token');
        });

        it('Deve retornar erro ao tentar realizar login com credenciais inválidas', async () => {
            const response = await request('http://localhost:4000')
                .post('/graphql')
                .send({
                    query: `
                        mutation Login($email: String!, $password: String!) {
                            login(email: $email, password: $password) {
                                token
                        }
                    }`,
                    variables: {
                        email: 'email_invalido@email.com', 
                        password: 'senha123'
                    }
                });

                expect(response.body.errors[0].message).to.equal("Credenciais inválidas");
        });
    });

});
