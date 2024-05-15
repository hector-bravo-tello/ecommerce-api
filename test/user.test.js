const request = require('supertest');
const app = require('../server'); // Adjust this path to your Express app export

const userId = 9;
const email = 'test16@example.com';
const password = 'password123';

// Variables to store cookies
let cookies;
let accessTokenCookie;

describe('User API Routes', () => {
    describe('POST /users/register', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/users/register')
                .send({ email: email, password: password, full_name: 'Test User' });
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully.');
        });
    });

    describe('POST /users/login', () => {
        test('should login the user', async () => {
            const response = await request(app)
                .post('/users/login')
                .send({ email: email, password: password });
            
            //cookies = response.headers['set-cookie'];
            //accessTokenCookie = cookies.find(cookie => cookie.startsWith('accessToken='));

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Login successful.');
        });
    });

    describe('GET /users/:userId', () => {
        test('should retrieve user details', async () => {
            const response = await request(app)
                .get(`/users/${userId}`);
                //.set('Cookie', accessTokenCookie);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('email');
            expect(response.body).toHaveProperty('full_name');
        });
    });

    describe('PUT /users/:userId', () => {
        test('should update the user details', async () => {
            const response = await request(app)
                .put(`/users/${userId}`)
                //.set('Cookie', accessTokenCookie)
                .send({ email: 'updated@example.com', full_name: 'Updated Name' });
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'User updated successfully.');
        });
    });

    describe('DELETE /users/:userId', () => {
        test('should delete the user', async () => {
            const response = await request(app)
                .delete(`/users/${userId}`);
                //.set('Cookie', accessTokenCookie);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'User deleted successfully.');
        });
    });

    describe('DELETE /users/logout', () => {
        test('should logout the user', async () => {
            const response = await request(app)
                .delete(`/users/logout/${userId}`);
            
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'User logged out successfully.');
        });
    });
});
