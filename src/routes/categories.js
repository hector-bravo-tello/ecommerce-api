const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticateToken');
const categoryController = require('../controllers/categoryController');

// Get all categories
router.get('/', authenticate, categoryController.getAllCategories);

// Get a single category by id
router.get('/:categoryId', authenticate, categoryController.getCategoryById);

// Create a new category
router.post('/', authenticate, categoryController.createCategory);

// Update an existing category
router.put('/:categoryId', authenticate, categoryController.updateCategory);

// Delete a category
router.delete('/:categoryId', authenticate, categoryController.deleteCategory);

module.exports = router;
