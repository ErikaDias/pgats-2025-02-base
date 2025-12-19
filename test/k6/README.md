# Testes de Performance com K6

## Objetivo do Projeto

Este projeto foi desenvolvido como Trabalho de Conclusão da Disciplina e tem como objetivo implementar ao menos um teste automatizado de performance utilizando o K6 em uma API que foi construída ao longo do curso.

## Arquitetura do Projeto

```
/tests
 └── /k6
    ├── /helpers
    │   ├── auth.js                # Helper de autenticação
    │   ├── headers.js             # Helper de headers
    │   └── data.js                # Dados para testes (Data-Driven)
    ├── /reports 
    │   ├── resultado.html         # Relatório HTML gerado após a execução do teste 
    ├── /tests     
    │   ├── performance.js         # Script principal de testes de performance
    └── /utils
        ├── config.js              # Configuração de variáveis de ambiente
        └── faker.js               # Geração de dados dinâmicos
    ├── README.md                  # Documentação do projeto e explicação dos conceitos
```
<br>

# Conceitos Aplicados

### **Variável de Ambiente**
O código abaixo está armazenado no arquivo **test/k6/utils/config.js** e demonstra o uso do conceito de Variável de Ambiente, permitindo configurar a URL base da API sem alterar o código.
```js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api';
```

---

### **Helpers**
O código abaixo está armazenado no arquivo **test/k6/helpers/auth.js** e demonstra o uso do conceito de Helpers, encapsulando a lógica de autenticação em uma função reutilizável.
```js
export function login(email, password) {
  const payload = JSON.stringify({ email, password });

  return http.post(
    `${BASE_URL}/users/login`,
    payload,
    { headers: getHeaders() }
  );
}
```
---

### **Data-Driven Testing**
O código abaixo está armazenado no arquivo **test/k6/helpers/data.js** e demonstra o uso do conceito de Data-Driven Testing, separando os dados da lógica de teste.
```js
export const users = [
  { email: 'user@email.com', password: '123456' },
];
```
---

### **Reaproveitamento de Resposta**
O código abaixo está armazenado no arquivo **test/k6/tests/performance.test.js** e demonstra o uso do conceito de Reaproveitamento de Resposta, no qual um dado retornado por uma requisição é reutilizado em outro fluxo do teste.
```js
group('Login do usuário', () => {
  const user = users[0];

  const res = login(user.email, user.password);

  check(res, {
    'login retornou 200': r => r.status === 200,
    'token retornado': r => r.json('token') !== undefined,
  });

  token = res.json('token');
});
```
---

### **Uso de Token de Autenticação**
O código abaixo está armazenado no arquivo **test/k6/helpers/headers.js** e demonstra o uso do conceito de Uso de Token de Autenticação, preparando o header de autorização para requisições autenticadas.
```js
export function getHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
```
---

### **Groups**
O código abaixo está armazenado no arquivo **test/k6/tests/performance.test.js** e demonstra o uso do conceito de Groups e dentro dela faço o uso de Helpers, Faker, Variável de Ambiente, Trends, Checks e Data-Driven.
```js
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
```
---

### **Checks**
O código abaixo está armazenado no arquivo **test/k6/tests/performance.test.js** e demonstra o uso do conceito de Checks, utilizado para validar as respostas da API durante o teste de performance.
```js
check(res, {
  'status é 200': r => r.status === 200,
  'token retornado': r => r.json('token') !== undefined,
});
```
---

### **Trends**
O código abaixo está armazenado no arquivo **test/k6/tests/performance.test.js** e demonstra o uso do conceito de Trends, utilizado para coletar métricas customizadas de tempo de resposta.
```js
const checkoutDuration = new Trend('checkout_duration');
checkoutDuration.add(res.timings.duration);
```
---

### **Thresholds e Stages**
O código abaixo está armazenado no arquivo **test/k6/tests/performance.test.js** e demonstra o uso do conceito de Thresholds, utilizado para definir critérios mínimos de desempenho e sucesso do teste de performance e Stages, utilizado para simular variação de carga ao longo do tempo.
```js
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
  },
};
```
---

### **Faker**
O código abaixo está armazenado no arquivo **test/k6/utils/faker.js** e demonstra o uso da biblioteca Faker para geração de dados dinâmicos durante os testes.
```js
export function generateUser() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: '123456',
  };
}
```

## Relatório de Execução do Teste
O relatório do teste de performance foi gerado utilizando o **Web Dashboard do K6**, com exportação no formato **HTML**.

#### Comando para gerar o relatório (informando a URL via variável de ambiente)
```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=test/k6/reports/resultado.html k6 run -e BASE_URL=http://localhost:3000/api test/k6/tests/performance.test.js
```
#### Comando para gerar o relatório (utilizando a URL padrão do projeto)
```bash
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=test/k6/reports/resultado.html k6 run test/k6/tests/performance.test.js
```