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

// Get the cart items for a user
exports.getUserCart = async (req, res) => {
    const cartId = await ensureCart(req.userId);
    try {
        const result = await db.query('SELECT * FROM get_user_cart($1)', [cartId]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Failed to get user cart:', error);
        res.status(500).json({ error: error.message });
    }
};

// Add an item to the cart
exports.addItemToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    const cartId = await ensureCart(req.userId);
    try {
        const result = await db.query('SELECT * FROM add_item_to_cart($1, $2, $3)', [cartId, productId, quantity]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to add item to cart:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update item quantity in the cart
exports.updateCartItem = async (req, res) => {
    const cartId = await ensureCart(req.userId);
    const { quantity } = req.body;
    try {
        const result = await db.query(
            'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
            [quantity, cartId, req.productId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Failed to update quantity:', error);
        res.status(500).json({ error: error.message });
    }
};

// Remove an item from the cart
exports.removeItemFromCart = async (req, res) => {
    const cartId = await ensureCart(req.userId);
    try {
        const result = await db.query(
            'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
            [cartId, req.productId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }
        res.status(200).json({ message: 'Item removed successfully' });
    } catch (error) {
        console.error('Failed to remove item:', error);
        res.status(500).json({ error: error.message });
    }
};

// Clear all items from the cart
exports.clearCart = async (req, res) => {
    const cartId = await ensureCart(req.userId);
    try {
        await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        res.status(200).json({ message: 'Cart cleared successfully' });
    } catch (error) {
        console.error('Failed to clear cart:', error);
        res.status(500).json({ error: error.message });
    }
};
