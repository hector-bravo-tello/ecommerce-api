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
router.get('/', productController.getAllProducts);

// Create a new product
router.post('/', productController.createProduct);

// Get a single product by id
router.get('/:productId', productController.getProductById);

// Update an existing product
router.put('/:productId', productController.updateProduct);

// Delete a product
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
