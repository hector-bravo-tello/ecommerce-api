const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const userController = require('../controllers/userController');

// User registration
router.post('/register', userController.registerUser);

// User login
router.post('/login', userController.loginUser);

// Logout user
router.delete('/logout/:userId', authenticate, userController.logoutUser);

// Retrieve user details
router.get('/:userId', authenticate, userController.getUserById);

// Update user details
router.put('/:userId', authenticate, userController.updateUser);

// Update password
router.put('/password/:userId', authenticate, userController.changePassword);

// Delete a user
router.delete('/:userId', authenticate, userController.deleteUser);

module.exports = router;
