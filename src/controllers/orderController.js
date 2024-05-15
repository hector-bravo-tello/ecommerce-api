const db = require('../config/db');

async function ensureCart(userId) {
    try {
        const cartCheck = await db.query('SELECT id FROM carts WHERE user_id = $1 AND status_id = 1', [userId]);
        if (cartCheck.rows.length === 0) {
            // Assuming 'Created' status has an ID of 1
            const newCart = await db.query(
                'INSERT INTO carts (user_id, status_id) VALUES ($1, 1) RETURNING id',
                [userId]
            );
            return newCart.rows[0].id; // Return the ID of the newly created cart
        }
        return cartCheck.rows[0].id; // Return the ID of the existing cart
    } catch (error) {
        console.error('Error ensuring cart:', error);
        throw error;  // Re-throw the error to be handled by the caller
    }
}

exports.createOrder = async (req, res) => {
    const { shippingFee, tax, paymentMethodId } = req.body;
 
    try {
        // Ensure the cart exists and get the cart_id
        const cartId = await ensureCart(req.userId);

        // Call the stored procedure to create the order from the cart
        const result = await db.query(`
            SELECT create_order_from_cart($1, $2, $3, $4, $5) AS order_id`,
            [req.userId, cartId, shippingFee, tax, paymentMethodId]
        );

        // If the stored procedure executed successfully
        if (result.rows.length > 0) {
            res.status(201).json({ message: "Order created successfully", orderId: result.rows[0].order_id });
        } else {
            res.status(404).json({ message: "Failed to create order" });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all orders for a user
exports.getAllUserOrders = async (req, res) => {
    try {
        const orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [req.userId]);
        res.status(200).json(orders.rows);
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get a specific order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await db.query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.orderId, req.userId]);
        if (order.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order.rows[0]);
    } catch (error) {
        console.error('Error getting order:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    const { statusId } = req.body; // New status ID from admin
    try {
        const updatedOrder = await db.query(`
            UPDATE orders SET status_id = $1 WHERE id = $2 RETURNING *`,
            [statusId, req.orderId]);
        if (updatedOrder.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder.rows[0]);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message });
    }
};

/// Cancel an order
exports.cancelOrder = async (req, res) => {
    try {
        const canceledOrder = await db.query(`
            DELETE FROM orders WHERE id = $1 AND user_id = $2 RETURNING *`,
            [req.orderId, req.userId]);
        if (canceledOrder.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found or user mismatch' });
        }
        res.status(200).json({ message: 'Order canceled successfully' });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ error: error.message });
    }
};