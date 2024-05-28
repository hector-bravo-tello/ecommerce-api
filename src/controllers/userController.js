const db = require('../config/db');
const tokenUtil = require('../utils/tokenUtil');
const bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');

// Register a new user
exports.registerUser = [
    check('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('full_name').notEmpty().withMessage('Full name is required').trim().escape(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, full_name } = req.body;
        try {
            // Check if email already exists
            const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            // Generate salt
            const salt = await bcrypt.genSalt(10);
            // Hash the password with the salt
            const hash = await bcrypt.hash(password, salt);
            const result = await db.query(
                'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id',
                [email, hash, full_name]
            );
            const userId = result.rows[0].id;
            const accessToken = tokenUtil.generateAccessToken(userId);
            const refreshToken = tokenUtil.generateRefreshToken(userId);
            
            // Set access token cookie
            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                //secure: true,
                sameSite: 'Strict',
                signed: true,
                maxAge: 900000 // milliseconds
            });

            // Set refresh token cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                //secure: true,
                sameSite: 'Strict',
                signed: true,
                maxAge: 604800000 // milliseconds
            });

            res.status(201).json({ userId: userId, message: "User registered successfully." });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// User login
exports.loginUser = [
    check('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    check('password').notEmpty().withMessage('Password is required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await db.query("SELECT id, email, password_hash FROM users WHERE email = $1", [email]);
            if (user.rows.length) {
                const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
                if (isValid) {
                    const userId = user.rows[0].id;
                    const accessToken = tokenUtil.generateAccessToken(userId);
                    const refreshToken = tokenUtil.generateRefreshToken(userId);
                    
                    // Set access token cookie
                    res.cookie('accessToken', accessToken, {
                        httpOnly: true,
                        //secure: true,
                        sameSite: 'Strict',
                        signed: true,
                        maxAge: 900000 // milliseconds
                    });

                    // Set refresh token cookie
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        //secure: true,
                        sameSite: 'Strict',
                        signed: true,
                        maxAge: 604800000 // milliseconds
                    });
                    
                    res.status(200).json({ message: "Login successful." });
                } else {
                    res.status(401).json({ message: "Invalid credentials." });
                }
            } else {
                res.status(404).json({ message: "User not found." });
            }
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Get user by ID
exports.getUserById = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await db.query("SELECT id, email, full_name FROM users WHERE id = $1", [req.params.userId]);
            if (user.rows.length) {
                res.status(200).json(user.rows[0]);
            } else {
                res.status(404).json({ message: "User not found." });
            }
        } catch (error) {
            console.error('Error getting user:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Update user details
exports.updateUser = [
    check('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
    check('full_name').notEmpty().withMessage('Full name is required').trim().escape(),
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, full_name } = req.body;
        const userId = req.params.userId;
        try {
            // Check if email already exists for another user
            const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ message: 'Email already exists for another user' });
            }

            await db.query('UPDATE users SET email = $1, full_name = $2 WHERE id = $3', [email, full_name, userId]);
            res.status(200).json({ message: "User updated successfully." });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Change user password
exports.changePassword = [
    check('old_password').notEmpty().withMessage('Old password is required').trim().escape(),
    check('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long').trim().escape(),
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { old_password, new_password } = req.body;
        const userId = req.params.userId;

        try {
            // Retrieve the user's current password hash from the database
            const user = await db.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

            if (user.rows.length) {
                // Check if the old password is correct
                const isMatch = await bcrypt.compare(old_password, user.rows[0].password_hash);
                if (!isMatch) {
                    return res.status(400).json({ message: 'Old password is incorrect' });
                }

                // Generate a new salt and hash the new password
                const salt = await bcrypt.genSalt(10);
                const newPasswordHash = await bcrypt.hash(new_password, salt);

                // Update the password in the database
                await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newPasswordHash, userId]);

                res.status(200).json({ message: 'Password changed successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Delete a user
exports.deleteUser = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            await db.query('DELETE FROM users WHERE id = $1', [req.params.userId]);
            res.status(200).json({ message: "User deleted successfully." });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: error.message });
        }
    }
];

// Logout user
exports.logoutUser = [
    check('userId').isInt().withMessage('User ID must be an integer').toInt(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.params.userId]);
            
            res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', signed: true });
            res.clearCookie('accessToken', { httpOnly: true, sameSite: 'Strict', signed: true });

            res.status(200).json({ message: "User logged out successfully." });
        } catch (error) {
            console.error('Error logging out user:', error);
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
];
