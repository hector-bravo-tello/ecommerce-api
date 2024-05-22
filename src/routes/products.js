const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const productController = require('../controllers/productController');

router.param('productId', (req, res, next, id) => {
    const productId = parseInt(req.params.productId);
    if (!isNaN(productId) && productId > 0) {
        req.productId = productId;
        next();
    } else {
        res.status(400).send("Invalid productId.");
    }
});

// Get all products
router.get('/', authenticate, productController.getAllProducts);

// Create a new product
router.post('/', authenticate, productController.createProduct);

// Get a single product by id
router.get('/:productId', authenticate, productController.getProductById);

// Update an existing product
router.put('/:productId', authenticate, productController.updateProduct);

// Delete a product
router.delete('/:productId', authenticate, productController.deleteProduct);

module.exports = router;

