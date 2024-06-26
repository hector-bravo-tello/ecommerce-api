const jwt = require('jsonwebtoken');
const db = require('../config/db');
const tokenUtil = require('../utils/tokenUtil');
require('dotenv').config();

// if refresh token is valid, it will generate a new access token
exports.refreshToken = async (req, res) => {
    try {
        const refreshToken = req.signedCookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided." });
        }

        const queryText = 'SELECT token, user_id, expires_at FROM refresh_tokens WHERE token = $1';
        const result = await db.query(queryText, [refreshToken]);

        if (result.rows.length === 0) {
            return res.sendStatus(403);  // refresh token doesn't exist in the database
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.sendStatus(403); // Forbidden if token is invalid or expired
            }
            // generate new access token
            tokenUtil.generateAccessTokenWithCookie(res, user.id);
            
            res.status(200).json({ message: "Access token refreshed successfully." });
        });
    } catch (error) {
        console.error('Database or token verification error:', error);
        res.status(500).send('Server error');
    }
};
