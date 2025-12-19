export function getHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token !== null) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}
