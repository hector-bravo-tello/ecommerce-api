const request = require('supertest');
const app = require('../server');

describe('Ecommerce API', () => {
  let userId;
  let productId_1;
  let productId_2;
  let orderId;
  let cartItemId;
  let categoryId;
  let addressId;
  let token;

  const generateRandomEmail = () => {
    const randomString = Math.random().toString(36).substring(2, 11);
    return `${randomString}@example.com`;
  };

  const testData = {
    user: {
      email: generateRandomEmail(),
      password: 'password123',
      full_name: 'Test User'
    },
    product_1: {
      name: 'Test Product 1',
      description: 'Test Description 1',
      price: 100,
      stock: 10,
      image_url: 'http://example.com/image.jpg'
    },
    product_2: {
      name: 'Test Product 2',
      description: 'Test Description 2',
      price: 100,
      stock: 10,
      image_url: 'http://example.com/image.jpg'
    },
    updatedProduct: {
      name: 'Updated Product',
      description: 'Updated Description',
      price: 150,
      stock: 5,
      image_url: 'http://example.com/updated_image.jpg'
    },
    address: {
      address_line1: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      postal_code: '12345'
    },
    updatedAddress: {
      address_line1: '456 Updated St',
      city: 'Updated City',
      state: 'UC',
      country: 'Updated Country',
      postal_code: '67890'
    },
    category: {
      name: 'Test Category',
      description: 'Test Category Description'
    },
    updatedCategory: {
      name: 'Updated Category',
      description: 'Updated Category Description'
    },
    order: {
      shipping_fee: 10.00,
      tax: 5.00,
      paymentMethodId: 1
    }
  };

  beforeAll(async () => {
    // Register a new user and get the user ID
    const userRes = await request(app)
      .post('/api/users/register')
      .send(testData.user);
    userId = userRes.body.id;

    // Login the user and get the token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: testData.user.email,
        password: testData.user.password
      });
    token = loginRes.headers['set-cookie'][0];

    // Create a product category
    const res = await request(app)
      .post('/api/categories')
      .set('Cookie', token)
      .send(testData.category);
    categoryId = res.body.id;

    // Create product_1 and get the product ID
    const productRes1 = await request(app)
      .post('/api/products')
      .set('Cookie', token)
      .send({ ...testData.product_1, categoryId: categoryId });
    productId_1 = productRes1.body.id;

    // Create product_2 and get the product ID
    const productRes2 = await request(app)
      .post('/api/products')
      .set('Cookie', token)
      .send({ ...testData.product_2, categoryId: categoryId });
    productId_2 = productRes2.body.id;
  });

  // User tests
  it('should retrieve user details', async () => {
    try {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      //expect(res.body).toHaveProperty('email', testData.user.email);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should update user details', async () => {
    try {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Cookie', token)
        .send({
          email: generateRandomEmail(),
          full_name: 'New Name'
        });
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  // Address tests
  it('should create a new address', async () => {
    try {
      const res = await request(app)
        .post('/api/addresses')
        .set('Cookie', token)
        .send({ ...testData.address, userId: userId });
      expect(res.statusCode).toEqual(201);
      //expect(res.body).toHaveProperty('id');
      addressId = res.body.id;
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should list all addresses for a user', async () => {
    try {
      const res = await request(app)
        .get(`/api/addresses/user/${userId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should retrieve address details', async () => {
    try {
      const res = await request(app)
        .get(`/api/addresses/${addressId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      //expect(res.body).toHaveProperty('country', testData.address.country);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should update address details', async () => {
    try {
      const res = await request(app)
        .put(`/api/addresses/${addressId}`)
        .set('Cookie', token)
        .send(testData.updatedAddress);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  // Product tests
  it('should list all products', async () => {
    try {
      const res = await request(app)
        .get('/api/products')
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should retrieve product details', async () => {
    try {
      const res = await request(app)
        .get(`/api/products/${productId_1}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      //expect(res.body).toHaveProperty('name', testData.product_1.name);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should update product details', async () => {
    try {
      const res = await request(app)
        .put(`/api/products/${productId_1}`)
        .set('Cookie', token)
        .send({ ...testData.updatedProduct, categoryId: categoryId });
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  // Cart tests
  it('should add first item to cart', async () => {
    try {
      const res = await request(app)
        .post(`/api/carts/${userId}/products`)
        .set('Cookie', token)
        .send({
          productId: productId_1,
          quantity: 2
        });
      expect(res.statusCode).toEqual(201);
      //expect(res.body).toHaveProperty('id');
      cartItemId = res.body.id;
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should add second item to cart', async () => {
    try {
      const res = await request(app)
        .post(`/api/carts/${userId}/products`)
        .set('Cookie', token)
        .send({
          productId: productId_2,
          quantity: 1
        });
      expect(res.statusCode).toEqual(201);
      //expect(res.body).toHaveProperty('id');
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should retrieve user cart', async () => {
    try {
      const res = await request(app)
        .get(`/api/carts/${userId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should update cart item quantity', async () => {
    try {
      const res = await request(app)
        .put(`/api/carts/${userId}/products/${productId_1}`)
        .set('Cookie', token)
        .send({
          quantity: 3
        });
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should remove item from cart', async () => {
    try {
      const res = await request(app)
        .delete(`/api/carts/${userId}/products/${productId_1}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should clear user cart', async () => {
    try {
      const res = await request(app)
        .delete(`/api/carts/${userId}/clear`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should add item to cart before order', async () => {
    try {
      const res = await request(app)
        .post(`/api/carts/${userId}/products`)
        .set('Cookie', token)
        .send({
          productId: productId_1,
          quantity: 2
        });
      expect(res.statusCode).toEqual(201);
      //expect(res.body).toHaveProperty('id');
      cartItemId = res.body.id;
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  // Order tests
  it('should create a new order', async () => {
    try {
      const res = await request(app)
        .post(`/api/orders/${userId}`)
        .set('Cookie', token)
        .send({ ...testData.order, addressId: addressId });
      expect(res.statusCode).toEqual(201);
      //expect(res.body).toHaveProperty('id');
      orderId = res.body.id;
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should list user orders', async () => {
    try {
      const res = await request(app)
        .get(`/api/orders/${userId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should retrieve order details', async () => {
    try {
      const res = await request(app)
        .get(`/api/orders/${userId}/${orderId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      //expect(res.body).toHaveProperty('id', orderId);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should update order status', async () => {
    try {
      const res = await request(app)
        .put(`/api/orders/${orderId}`)
        .set('Cookie', token)
        .send({
          statusId: 2
        });
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should cancel an order', async () => {
    try {
      const res = await request(app)
        .delete(`/api/orders/${orderId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  // Category tests
  it('should list all categories', async () => {
    try {
      const res = await request(app)
        .get('/api/categories')
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should retrieve category details', async () => {
    try {
      const res = await request(app)
        .get(`/api/categories/${categoryId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
      //expect(res.body).toHaveProperty('name', testData.category.name);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should update category details', async () => {
    try {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', token)
        .send(testData.updatedCategory);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  // Cleanup
  it('should delete an address', async () => {
    try {
      const res = await request(app)
        .delete(`/api/addresses/${addressId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should delete product', async () => {
    try {
      const res = await request(app)
        .delete(`/api/products/${productId_1}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should delete product', async () => {
    try {
      const res = await request(app)
        .delete(`/api/products/${productId_2}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should delete a category', async () => {
    try {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });

  it('should logout a user', async () => {
    try {
      const res = await request(app)
        .delete(`/api/users/logout/${userId}`)
        .set('Cookie', token);
      expect(res.statusCode).toEqual(200);
    } catch (error) {
      console.log(error.response ? error.response.body : error.message);
      throw error;
    }
  });
});
