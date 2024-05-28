const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const orderController = require('../controllers/orderController');

// Create an order from the user's cart
router.post('/:userId', authenticate, orderController.createOrder);

// Get all orders for a user
router.get('/:userId', authenticate, orderController.getAllUserOrders);

// Get a specific order by ID
router.get('/:userId/:orderId', authenticate, orderController.getOrderById);

// Update order status (requires admin privileges potentially)
router.put('/:orderId/status', authenticate, orderController.updateOrderStatus);

// Cancel an order
router.delete('/:userId/:orderId', authenticate, orderController.cancelOrder);

module.exports = router;
