import http from 'k6/http';
import { getHeaders } from './headers.js';
import { BASE_URL } from '../utils/config.js';

export function login(email, password) {
  const payload = JSON.stringify({ email, password });

  return http.post(
    `${BASE_URL}/users/login`,
    payload,
    { headers: getHeaders() }
  );
}
