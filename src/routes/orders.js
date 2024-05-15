const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const orderController = require('../controllers/orderController');

router.param('userId', (req, res, next, id) => {
    const userId = parseInt(req.params.userId);
    if (!isNaN(userId) && userId > 0) {
        req.userId = userId;
        next();
    } else {
        res.status(400).send("Invalid userId.");
    }
});

router.param('orderId', (req, res, next, id) => {
    const orderId = parseInt(req.params.orderId);
    if (!isNaN(orderId) && orderId > 0) {
        req.orderId = orderId;
        next();
    } else {
        res.status(400).send("Invalid orderId.");
    }
});

// Create an order from the user's cart
router.post('/:userId', orderController.createOrder);

// Get all orders for a user
router.get('/:userId', orderController.getAllUserOrders);

// Get a specific order by ID
router.get('/:userId/:orderId', orderController.getOrderById);

// Update order status (requires admin privileges potentially)
router.put('/:orderId/status', orderController.updateOrderStatus);

// Cancel an order
router.delete('/:userId/:orderId', orderController.cancelOrder);

module.exports = router;
