const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    // Retrieve the token from cookies
    const token = req.signedCookies.accessToken;
    //console.log("Cookies:", req.signedCookies);

    if (!token) {
        return res.sendStatus(401); // No token found, unauthorized
    }

    // Verify the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification failed:', err);
            return res.sendStatus(403); // Invalid token, forbidden
        }
        req.user = user;
        next(); // Proceed if token is valid
    });
};

module.exports = authenticateToken;