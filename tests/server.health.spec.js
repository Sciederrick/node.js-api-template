const request = require("supertest");

const baseUrl = `http://localhost:3005`;

describe('Health check endpoint', () => {
	it('should return a 200 status code', async () => {
		const response = await request(baseUrl)
			.get('/api/v1')
			.set('Accept', 'application/json');

		expect(response.statusCode).toBe(200);
	}, 20_000);
});