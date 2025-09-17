const request = require('supertest');
const {expect} = require('chai');
const User = require('../../../src/models/User');

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {

        beforeEach(async () => {
            const respostaLogin = await request('http://localhost:3000')
                .post('/api/users/login')
                .send({
                    email: User[1].email,
                    password: User[1].password
                });

            token = respostaLogin.body.token;

        });

        it('Deve retornar 200 quando o checkout for realizado com sucesso no cartão de crédito', async () => {
            const checkoutData = {
                items: [
                    {
                        productId: 1,
                        quantity: 2
                    }
                ],
                freight: 15,
                paymentMethod: 'credit_card',
                cardData: {
                    number: '4111111111111111',
                    name: 'Erika Dias',
                    expiry: '12/32',
                    cvv: '123'
                }
            };

            const response = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(checkoutData);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('userId', 2);
            expect(response.body.items[0]).to.have.property('productId', checkoutData.items[0].productId);
            expect(response.body.items[0]).to.have.property('quantity', checkoutData.items[0].quantity);
            expect(response.body).to.have.property('freight', checkoutData.freight);
            expect(response.body).to.have.property('paymentMethod', checkoutData.paymentMethod);
        });

        it('Deve retornar 200 quando o checkout for realizado com sucesso no boleto', async () => {
            const checkoutData = {
                items: [
                    {
                        productId: 1,
                        quantity: 2
                    }
                ],
                freight: 15,
                paymentMethod: 'boleto',
            };

            const response = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(checkoutData);

            expect(response.status).to.equal(200);
                expect(response.body).to.have.property('items');
                expect(response.body.items).to.be.an('array');
                expect(response.body.items[0]).to.have.property('productId', 1);
                expect(response.body.items[0]).to.have.property('quantity', 2);
        });

        it('Deve retornar 400 quando o checkout falhar por dados inválidos', async () => {
            const checkoutData = {
                items: [
                    {
                        productId: 99, // Produto inválido
                        quantity: 2
                    }
                ],
                freight: 15,
                paymentMethod: 'credit_card',
                cardData: {
                    number: '4111111111111111',
                    name: 'Erika Dias',
                    expiry: '12/32',
                    cvv: '123'
                }
            };

            const response = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(checkoutData);

            expect(response.status).to.equal(400);
            expect(response.body).to.have.property('error', 'Produto não encontrado');
        });

        it('Deve retornar 401 quando o checkout não for autorizado', async () => {
            const checkoutData = {
                items: [
                    {
                        productId: 1,
                        quantity: 2
                    }
                ],
                freight: 15,
                paymentMethod: 'credit_card',
                cardData: {
                    number: '4111111111111111',
                    name: 'Erika Dias',
                    expiry: '12/32',
                    cvv: '123'
                }
            };

            const response = await request('http://localhost:3000')
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}a547`)
                .send(checkoutData);

            expect(response.status).to.equal(401);
            expect(response.body).to.have.property('error', 'Token inválido');  
        });
    });
});