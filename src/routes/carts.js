const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const cartController = require('../controllers/cartController');

router.param('userId', (req, res, next, id) => {
    const userId = parseInt(req.params.userId);
    if (!isNaN(userId) && userId > 0) {
        req.userId = userId;
        next();
    } else {
        res.status(400).send("Invalid userId.");
    }
});

router.param('productId', (req, res, next, id) => {
    const productId = parseInt(req.params.productId);
    if (!isNaN(productId) && productId > 0) {
        req.productId = productId;
        next();
    } else {
        res.status(400).send("Invalid productId.");
    }
});

// Get the cart for a user
router.get('/:userId', cartController.getUserCart);

// Add an item to the cart
router.post('/:userId/items', cartController.addItemToCart);

// Clear all items from the cart
router.delete('/:userId/clear', cartController.clearCart);

// Update item quantity in the cart
router.put('/:userId/items/:productId', cartController.updateCartItem);

// Remove an item from the cart
router.delete('/:userId/items/:productId', cartController.removeItemFromCart);

module.exports = router;
