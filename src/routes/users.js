const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');

// Assuming you have these controllers defined elsewhere in your project
const {
    registerUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser,
    logoutUser
} = require('../controllers/userController');

//
// You should reorder the routes so that the more specific routes (like /logout) are defined before the more general routes that include parameters.
//

router.param('userId', (req, res, next, id) => {
    const userId = parseInt(req.params.userId);
    if (!isNaN(userId) && userId > 0) {
        req.userId = userId;
        next();
    } else {
        res.status(400).send("Invalid userId.");
    }
});

// User registration
router.post('/register', registerUser);

// User login
router.post('/login', loginUser);

// Logout user
router.delete('/logout/:userId', authenticate, logoutUser);

// Retrieve user details
router.get('/:userId', getUserById);

// Update user details
router.put('/:userId', updateUser);

// Delete a user
router.delete('/:userId', deleteUser);

module.exports = router;
