//
// Author: Hector Bravo
//

const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const csrf = require('csurf');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
require('dotenv').config();

const tokenRoutes = require('./src/routes/tokens');
const userRoutes = require('./src/routes/users');
const addressRoutes = require('./src/routes/addresses');
const categoryRoutes = require('./src/routes/categories');
const productRoutes = require('./src/routes/products');
const cartRoutes = require('./src/routes/carts');
const orderRoutes = require('./src/routes/orders');

const app = express();

// Middlewares
app.use(express.json());                            // Built-in middleware for JSON
app.use(express.urlencoded({ extended: true }));    // Built-in middleware for URL-encoded forms
app.use(cookieParser(process.env.COOKIE_SECRET));   // This will parse cookies attached to the client request object

const csrfProtection = csrf({ cookie: true });      // CSRF protection
app.use(csrfProtection);                            // Enable CSRF protection middleware

app.use(cors({ credentials: true }));               // Enable CORS
app.use(xss());                                     // XSS protection
app.use(helmet());                                  // Helmet middleware for security
app.use(morgan('dev'));                             // Morgan middleware to log HTTP requests

// Home
app.get('/', (req, res) => {
    res.send({
        message: "Ecommerce API!",
        status: 200,
    });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/token', tokenRoutes);

// CSRF error handling
app.use((err, req, res, next) => {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    res.status(403);
    res.send('Form tampered with.');
});

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
