const db = require('../config/db');
const { check, validationResult } = require('express-validator');

// Helper function to ensure cart exists for a user
async function ensureCart(userId, create) {
    try {
        const cartCheck = await db.query('SELECT id FROM carts WHERE user_id = $1 AND status_id = 1', [userId]);
        if (cartCheck.rows.length === 0) {
            if (create) {
                const newCart = await db.query('INSERT INTO carts (user_id, status_id) VALUES ($1, 1) RETURNING id', [userId]);
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
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    check('shipping_fee').isFloat({ min: 0 }).withMessage('Shipping fee must be a positive number').toFloat(),
    check('tax').isFloat({ min: 0 }).withMessage('Tax must be a positive number').toFloat(),
    check('paymentMethodId').isInt().withMessage('Payment Method ID must be an integer').toInt(),
    check('addressId').isInt().withMessage('Address ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { shipping_fee, tax, paymentMethodId, addressId } = req.body;
        const userId = req.params.userId;
        try {
            const cartId = await ensureCart(userId, false);
            if (!cartId) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            const result = await db.query(`
                SELECT create_order_from_cart($1, $2, $3, $4, $5, $6) AS id`,
                [userId, cartId, shipping_fee, tax, paymentMethodId, addressId]
            );
            res.status(201).json(result.rows[0]);
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

        const userId = req.params.userId;
        try {
            const result = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
            res.status(200).json(result.rows);
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

        const { userId, orderId } = req.params;
        try {
            const result = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [orderId, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(200).json(result.rows[0]);
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
        const orderId = req.params.orderId;
        try {
            const result = await db.query(`UPDATE orders SET status_id = $1 WHERE id = $2 RETURNING *`, [statusId, orderId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found or status mismatch' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Cancel an order (delete)
exports.cancelOrder = [
    check('orderId').isInt().withMessage('Order ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderId = req.params.orderId;
        try {
            const result = await db.query(`DELETE FROM orders WHERE id = $1 RETURNING *`, [orderId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Order not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Error deleting order:', error);
            res.status(500).json({ error: error.message });
        }
    }
];
