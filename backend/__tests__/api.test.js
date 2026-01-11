const request = require('supertest');
const app = require('../src/server');

describe('Notes API', () => {
  test('GET /api/test возвращает успешный ответ', async () => {
    const response = await request(app).get('/api/test');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });
});