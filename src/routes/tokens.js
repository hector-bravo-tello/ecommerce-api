const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const authController = require('../controllers/authController');

// Refresh token route
router.post('/', authController.refreshToken);

module.exports = router;
