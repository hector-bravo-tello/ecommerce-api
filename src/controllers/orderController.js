const db = require('../config/db');
const { check, validationResult } = require('express-validator');

// Helper function to ensure cart exists for a user
async function ensureCart(userId, create) {
    try {
        const cartCheck = await db.query('SELECT id FROM carts WHERE user_id = $1 AND status_id = 1', [userId]);
        if (cartCheck.rows.length === 0) {
            if (create) {
                const newCart = await db.query(
                    'INSERT INTO carts (user_id, status_id) VALUES ($1, 1) RETURNING id',
                    [userId]
                );
                return newCart.rows[0].id;
            } else {
                return null;
            }
        }
        return cartCheck.rows[0].id;
    } catch (error) {
        console.error('Error ensuring cart:', error);
        throw error;
    }
}

// Create a new order
exports.createOrder = [
    check('shippingFee').isFloat({ min: 0 }).withMessage('Shipping fee must be a positive number').toFloat(),
    check('tax').isFloat({ min: 0 }).withMessage('Tax must be a positive number').toFloat(),
    check('paymentMethodId').isInt().withMessage('Payment Method ID must be an integer').toInt(),
    check('addressId').isInt().withMessage('Address ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { shippingFee, tax, paymentMethodId, addressId } = req.body;
        try {
            const cartId = await ensureCart(req.params.userId, false);
            if (!cartId) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            const result = await db.query(`
                SELECT create_order_from_cart($1, $2, $3, $4, $5, $6) AS order_id`,
                [req.params.userId, cartId, shippingFee, tax, paymentMethodId, addressId]
            );

            if (result.rows.length > 0) {
                res.status(201).json({ message: "Order created successfully", orderId: result.rows[0].order_id });
            } else {
                res.status(404).json({ message: "Failed to create order" });
            }
        } catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Get all orders for a user
exports.getAllUserOrders = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [req.params.userId]);
            res.status(200).json(orders.rows);
        } catch (error) {
            console.error('Error getting orders:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Get a specific order by ID
exports.getOrderById = [
    check('orderId').isInt().withMessage('Order ID must be an integer').toInt(),
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const order = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.orderId, req.params.userId]);
            if (order.rows.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(order.rows[0]);
        } catch (error) {
            console.error('Error getting order:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Update order status
exports.updateOrderStatus = [
    check('statusId').isInt().withMessage('Status ID must be an integer').toInt(),
    check('orderId').isInt().withMessage('Order ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { statusId } = req.body;
        try {
            const updatedOrder = await db.query(`
                UPDATE orders SET status_id = $1 WHERE id = $2 RETURNING *`,
                [statusId, req.params.orderId]
            );
            if (updatedOrder.rows.length === 0) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(updatedOrder.rows[0]);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Cancel an order (delete)
exports.cancelOrder = [
    check('orderId').isInt().withMessage('Order ID must be an integer').toInt(),
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const canceledOrder = await db.query(`
                DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING *`,
                [req.params.orderId, req.params.userId]
            );
            if (canceledOrder.rows.length === 0) {
                return res.status(404).json({ message: 'Order not found or user mismatch' });
            }
            res.status(200).json({ message: 'Order canceled successfully' });
        } catch (error) {
            console.error('Error deleting order:', error);
            res.status(500).json({ error: error.message });
        }
    }
];
