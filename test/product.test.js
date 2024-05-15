const request = require('supertest');
const app = require('../server'); // Adjust the path to import your Express app

const productId = 7;

describe('Product Routes', () => {
    describe('GET /products', () => {
        it('should retrieve all products', async () => {
            const response = await request(app).get('/products');
            expect(response.statusCode).toBe(200);
            expect(Array.isArray(response.body)).toBeTruthy();
        });
    });

    describe('POST /products', () => {
        it('should create a new product', async () => {
            const product = {
                name: 'New Product',
                description: 'Product Description',
                price: 99.99,
                stock: 100
            };
            const response = await request(app).post('/products').send(product);
            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('id');
        });
    });

    describe('GET /products/:productId', () => {
        it('should retrieve a single product by id', async () => {
            const response = await request(app).get(`/products/${productId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('id', productId);
        });
    });

    describe('PUT /products/:productId', () => {
        it('should update an existing product', async () => {
            const productUpdates = {
                name: 'Updated Product',
                description: 'Updated Description',
                price: 109.99,
                stock: 50
            };
            const response = await request(app).put(`/products/${productId}`).send(productUpdates);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('name', productUpdates.name);
        });
    });

    describe('DELETE /products/:productId', () => {
        it('should delete a product', async () => {
            const response = await request(app).delete(`/products/${productId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('message', 'Product deleted successfully');
        });
    });
});
