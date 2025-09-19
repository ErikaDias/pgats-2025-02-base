const request = require('supertest');
const sinon = require('sinon');
const {expect} = require('chai');

const app = require('../../../rest/app');

const checkoutController = require('../../../src/services/checkoutService');

describe('Checkout Controller', () => {
    describe('POST /api/checkout', () => {

        beforeEach(async () => {
            const respostaLogin = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'bob@email.com',
                    password: '123456'
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

            const response = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(checkoutData);

            expect(response.status).to.equal(200);
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

            const response = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}`)
                .send(checkoutData);

            expect(response.status).to.equal(200);
        });

        it('Deve retornar 400 quando o checkout falhar por dados inválidos', async () => {
            const checkoutData = {
                items: [
                    {
                        productId: 999, // Produto inválido
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

            const response = await request(app)
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

            const response = await request(app)
                .post('/api/checkout')
                .set('Authorization', `Bearer ${token}invalid`)
                .send(checkoutData);

            expect(response.status).to.equal(401);
            
        });
 
    });
});