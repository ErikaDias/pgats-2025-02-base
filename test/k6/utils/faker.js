import { faker } from 'https://cdn.skypack.dev/@faker-js/faker';

export function generateUser() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: '123456'
  };
}
