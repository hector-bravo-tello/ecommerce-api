const db = require('../config/db');
const { check, validationResult } = require('express-validator');

// Get all products
exports.getAllProducts = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products');
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No Products' });
        }
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single product by id
exports.getProductById = [
    check('productId').isInt().withMessage('Product ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.productId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Get products by category_id
exports.getAllCategoryProducts = [
    check('categoryId').isInt().withMessage('Category ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const result = await db.query('SELECT * FROM products WHERE category_id = $1', [req.params.categoryId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'No products found for category' });
            }
            res.status(200).json(result.rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Create a new product
exports.createProduct = [
    check('categoryId').isInt().withMessage('Category ID must be an integer').toInt(),
    check('name').notEmpty().withMessage('Name is required').trim().escape(),
    check('description').optional().trim().escape(),
    check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat(),
    check('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer').toInt(),
    check('image_url').optional().isURL().withMessage('Invalid URL format').trim(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { categoryId, name, description, price, stock, image_url } = req.body;
        try {
            const result = await db.query(
                'INSERT INTO products (category_id, name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [categoryId, name, description, price, stock, image_url]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not inserted' });
            }
            res.status(201).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Update an existing product
exports.updateProduct = [
    check('productId').isInt().withMessage('Product ID must be an integer').toInt(),
    check('categoryId').isInt().withMessage('Category ID must be an integer').toInt(),
    check('name').notEmpty().withMessage('Name is required').trim().escape(),
    check('description').optional().trim().escape(),
    check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat(),
    check('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer').toInt(),
    check('image_url').optional().isURL().withMessage('Invalid URL format').trim(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { categoryId, name, description, price, stock, image_url } = req.body;
        try {
            const result = await db.query(
                'UPDATE products SET category_id = $1, name = $2, description = $3, price = $4, stock = $5, image_url = $6 WHERE id = $7 RETURNING *',
                [categoryId, name, description, price, stock, image_url, req.params.productId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];

// Delete a product
exports.deleteProduct = [
    check('productId').isInt().withMessage('Product ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.productId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
];
