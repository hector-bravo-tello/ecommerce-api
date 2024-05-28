const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const cartController = require('../controllers/cartController');

// Get the cart for a user
router.get('/:userId', authenticate, cartController.getUserCart);

// Add an item to the cart
router.post('/:userId/items', authenticate, cartController.addItemToCart);

// Clear all items from the cart
router.delete('/:userId/clear', authenticate, cartController.clearCart);

// Update item quantity in the cart
router.put('/:userId/items/:productId', authenticate, cartController.updateCartItem);

// Remove an item from the cart
router.delete('/:userId/items/:productId', authenticate, cartController.removeItemFromCart);

module.exports = router;
