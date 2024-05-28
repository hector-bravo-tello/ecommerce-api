const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const addressController = require('../controllers/addressController');

// Get all addresses for a user
router.get('/user/:userId', authenticate, addressController.getAllAddressesByUser);

// Get address by id
router.get('/:addressId', authenticate, addressController.getAddressById);

// Create a new address
router.post('/', authenticate, addressController.createAddress);

// Update an address
router.put('/:addressId', authenticate, addressController.updateAddress);

// Delete an address
router.delete('/:addressId', authenticate, addressController.deleteAddress);

module.exports = router;