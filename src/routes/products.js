const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const productController = require('../controllers/productController');

// Get all products
router.get('/', authenticate, productController.getAllProducts);

// Create a new product
router.post('/', authenticate, productController.createProduct);

// Get a single product by id
router.get('/:productId', authenticate, productController.getProductById);

// Get products by category_id
router.get('/category/:categoryId', authenticate, productController.getAllCategoryProducts);

// Update an existing product
router.put('/:productId', authenticate, productController.updateProduct);

// Delete a product
router.delete('/:productId', authenticate, productController.deleteProduct);

module.exports = router;

