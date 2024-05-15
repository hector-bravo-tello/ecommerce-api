// src/controllers/userController.js
const db = require('../config/db');
const tokenUtil = require('../utils/tokenUtil');
const bcrypt = require('bcrypt');


// Register a new user
exports.registerUser = async (req, res) => {
    const { email, password, full_name } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10); // Hash the password
        const result = await db.query(
            'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id',
            [email, hash, full_name]
        );
        // generate tokens
        const userId = result.rows[0].id;
        const accessToken = tokenUtil.generateAccessToken(userId);
        const refreshToken = tokenUtil.generateRefreshToken(userId)
        
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
};

// User login
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db.query("SELECT id, email, password_hash FROM users WHERE email = $1", [email]);
        if (user.rows.length) {
            const isValid = await bcrypt.compare(password, user.rows[0].password_hash);
            if (isValid) {
                // generate tokens
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
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await db.query("SELECT id, email, full_name FROM users WHERE id = $1", [req.userId]);
        if (user.rows.length) {
            res.status(200).json(user.rows[0]);
        } else {
            res.status(404).json({ message: "User not found." });
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: error.message });
    }
};

// Update user details
exports.updateUser = async (req, res) => {
    const { email, full_name } = req.body;
    try {
        await db.query('UPDATE users SET email = $1, full_name = $2 WHERE id = $3', [email, full_name, req.userId]);
        res.status(200).json({ message: "User updated successfully." });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error.message });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
        res.status(200).json({ message: "User deleted successfully." });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.logoutUser = async (req, res) => {
    try {
        // delete refresh tokens from database
        const result = await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.userId]);
        
        // Clear the refresh token cookie
        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict', signed: true });
        
        // Clear the access token cookie 
        res.clearCookie('accessToken', { httpOnly: true, sameSite: 'Strict', signed: true });

        res.status(200).json({ message: "User logged out successfully." });

    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

