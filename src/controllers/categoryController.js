const db = require('../config/db');
const { check, validationResult } = require('express-validator');

// Get all product categories
exports.getAllCategories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM product_categories');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single category by Id
exports.getCategoryById = [
  check('categoryId').isInt().withMessage('Category ID must be an integer').toInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.categoryId;
    try {
      const result = await db.query('SELECT * FROM product_categories WHERE id = $1', [categoryId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Create a new category
exports.createCategory = [
  check('name').notEmpty().withMessage('Name is required').trim().escape(),
  check('description').optional().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO product_categories (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Update an existing category
exports.updateCategory = [
  check('categoryId').isInt().withMessage('Category ID must be an integer').toInt(),
  check('name').notEmpty().withMessage('Name is required').trim().escape(),
  check('description').optional().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;
    const categoryId = req.params.categoryId;
    try {
      const result = await db.query(
        'UPDATE product_categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
        [name, description, categoryId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Delete a category
exports.deleteCategory = [
  check('categoryId').isInt().withMessage('Category ID must be an integer').toInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryId = req.params.categoryId;
    try {
      const result = await db.query('DELETE FROM product_categories WHERE id = $1 RETURNING *', [categoryId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
