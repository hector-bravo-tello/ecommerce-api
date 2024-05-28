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

// Get the cart items for a user
exports.getUserCart = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // validate if there is cart, but doesn't create a new one
        const cartId = await ensureCart(req.params.userId, false);
        if (!cartId) { 
            return res.status(404).json({ message: 'Cart not found' }); 
        }

        try {
            const result = await db.query('SELECT * FROM get_user_cart($1)', [cartId]);
            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Failed to get user cart:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Add an item to the cart
exports.addItemToCart = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    check('productId').isInt().withMessage('Product ID must be an integer').toInt(),
    check('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, quantity } = req.body;

        // validate if there is cart, and create a new one if it doesn't exist
        const cartId = await ensureCart(req.params.userId, true);
        if (!cartId) { 
            return res.status(404).json({ message: 'Cart not found' }); 
        }

        try {
            const result = await db.query('SELECT * FROM add_item_to_cart($1, $2, $3)', [cartId, productId, quantity]);
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Failed to add item to cart:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Update item quantity in the cart
exports.updateCartItem = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    check('productId').isInt().withMessage('Product ID must be an integer').toInt(),
    check('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { productId, quantity } = req.body;

        // validate if there is cart, but doesn't create a new one
        const cartId = await ensureCart(req.params.userId, false);
        if (!cartId) { 
            return res.status(404).json({ message: 'Cart not found' }); 
        }

        try {
            const result = await db.query(
                'UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
                [quantity, cartId, productId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
            res.status(200).json(result.rows[0]);
        } catch (error) {
            console.error('Failed to update quantity:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Remove an item from the cart
exports.removeItemFromCart = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    check('productId').isInt().withMessage('Product ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // validate if there is cart, but doesn't create a new one
        const cartId = await ensureCart(req.params.userId, false);
        if (!cartId) { 
            return res.status(404).json({ message: 'Cart not found' }); 
        }

        try {
            const result = await db.query(
                'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2 RETURNING *',
                [cartId, req.params.productId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Cart item not found' });
            }
            res.status(200).json({ message: 'Item removed successfully' });
        } catch (error) {
            console.error('Failed to remove item:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Clear all items from the cart
exports.clearCart = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // validate if there is cart, but doesn't create a new one
        const cartId = await ensureCart(req.params.userId, false);
        if (!cartId) { 
            return res.status(404).json({ message: 'Cart not found' }); 
        }
        
        try {
            await db.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
            res.status(200).json({ message: 'Cart cleared successfully' });
        } catch (error) {
            console.error('Failed to clear cart:', error);
            res.status(500).json({ error: error.message });
        }
    }
];
