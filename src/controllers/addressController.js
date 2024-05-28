const db = require('../config/db');
const { check, validationResult } = require('express-validator');

// Get all addresses for a user
exports.getAllAddressesByUser = [
  check('userId').isInt().withMessage('User ID must be an integer').toInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.userId;
    try {
      const result = await db.query('SELECT * FROM user_addresses WHERE user_id = $1', [userId]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Get an address by ID
exports.getAddressById = [
  check('addressId').isInt().withMessage('Address ID must be an integer').toInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const addressId = req.params.addressId;
    try {
      const result = await db.query('SELECT * FROM user_addresses WHERE id = $1', [addressId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Create a new address
exports.createAddress = [
  check('user_id').isInt().withMessage('User ID must be an integer').toInt(),
  check('address_line1').notEmpty().withMessage('Address line 1 is required').trim().escape(),
  check('address_line2').optional().trim().escape(),
  check('city').notEmpty().withMessage('City is required').trim().escape(),
  check('state').notEmpty().withMessage('State is required').trim().escape(),
  check('postal_code').notEmpty().withMessage('Postal code is required').trim().escape(),
  check('country').notEmpty().withMessage('Country is required').trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, address_line1, address_line2, city, state, postal_code, country } = req.body;
    try {
      const result = await db.query(
        `INSERT INTO user_addresses (user_id, address_line1, address_line2, city, state, postal_code, country)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [user_id, address_line1, address_line2, city, state, postal_code, country]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Update an existing address
exports.updateAddress = [
  check('addressId').isInt().withMessage('Address ID must be an integer').toInt(),
  check('address_line1').notEmpty().withMessage('Address line 1 is required').trim().escape(),
  check('address_line2').optional().trim().escape(),
  check('city').notEmpty().withMessage('City is required').trim().escape(),
  check('state').notEmpty().withMessage('State is required').trim().escape(),
  check('postal_code').notEmpty().withMessage('Postal code is required').trim().escape(),
  check('country').notEmpty().withMessage('Country is required').trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { address_line1, address_line2, city, state, postal_code, country } = req.body;
    const addressId = req.params.addressId;
    try {
      const result = await db.query(
        `UPDATE user_addresses SET address_line1 = $1, address_line2 = $2, city = $3, state = $4,
         postal_code = $5, country = $6 WHERE id = $7 RETURNING *`,
        [address_line1, address_line2, city, state, postal_code, country, addressId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

// Delete an address
exports.deleteAddress = [
  check('addressId').isInt().withMessage('Address ID must be an integer').toInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const addressId = req.params.addressId;
    try {
      const result = await db.query('DELETE FROM user_addresses WHERE id = $1 RETURNING *', [addressId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.status(200).json({ message: 'Address deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
