//
// Author: Hector Bravo
//

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const tokenRoutes = require('./src/routes/tokens');
const userRoutes = require('./src/routes/users');
const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/carts');
const orderRoutes = require('./src/routes/orders');

const app = express();

// Middleware
app.use(cors({ credentials: true }));               // Enable CORS
app.use(express.json());                            // Built-in middleware for JSON
app.use(express.urlencoded({ extended: true }));    // Built-in middleware for URL-encoded forms
app.use(cookieParser(process.env.COOKIE_SECRET));   // This will parse cookies attached to the client request object

// Home
app.get('/', (req, res) => {
    res.send('E-commerce API!');
});

// Routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/token', tokenRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    res.status(404).send({
        error: "Not Found",
        status: 404,
        url: req.originalUrl
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        error: "Internal Server Error",
        message: err.message
    });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = server;
