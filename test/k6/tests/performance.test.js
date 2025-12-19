import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { BASE_URL } from '../utils/config.js';

let token;

import { login } from '../helpers/auth.js';
import { getHeaders } from '../helpers/headers.js';
import { users } from '../helpers/data.js';
import { generateUser } from '../utils/faker.js';

/* = Metricas Customizadas = */
const registerUserTrend = new Trend('register_user_duration');
const checkoutDuration = new Trend('checkout_duration');
const loginDuration = new Trend('login_duration');

/* = Configuação do Teste com Stages e Thresholds = */
export const options = {
  stages: [
    { duration: '10s', target: 2 }, 
    { duration: '20s', target: 5 }, 
    { duration: '10s', target: 0 }, 
  ],
  thresholds: { 
    http_req_duration: ['p(95)<800'],
    checks: ['rate>0.95'],
    register_user_duration: ['avg<500'],  
    checkout_duration: ['avg<700'],
    login_duration: ['avg<400']
  }
};

/* = Teste Principal = */
export default function (data) {

  group('Registrar um usuário', () => {
    const payload = JSON.stringify(generateUser());

    const res = http.post(
      `${BASE_URL}/users/register`,
      payload,
      { headers: getHeaders()}
    );

    registerUserTrend.add(res.timings.duration);

    check(res, {
      'Registrar usuário deve ter status igual a 201': r => r.status === 201,
    });
  });

  group('Login do usuário', () => {
    const user = users[0];

    const res = login(user.email, user.password);

    loginDuration.add(res.timings.duration);

    check(res, {
      'login retornou 200': r => r.status === 200,
      'token retornado': r => r.json('token') !== undefined,
    });

    token = res.json('token');
  });

  group('Checkout de um pedido', () => {
    const payload = JSON.stringify({
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
    });

    const res = http.post(
      `${BASE_URL}/checkout`,
      payload,
      { headers: getHeaders(token) }
    );

    checkoutDuration.add(res.timings.duration);

    check(res, {
      'Checkout deve ter status igual a 200': r => r.status === 200,
    });
  });

  sleep(1);
}