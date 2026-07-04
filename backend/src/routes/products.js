const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/products
router.get('/', async (req, res) => {
  const { category } = req.query;
  let query = 'SELECT * FROM products WHERE is_active=true';
  const params = [];
  if (category) { query += ' AND category=$1'; params.push(category); }
  query += ' ORDER BY created_at ASC';
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// GET /api/products/plans
router.get('/plans', async (req, res) => {
  const result = await pool.query('SELECT * FROM subscription_plans WHERE is_active=true ORDER BY type, price ASC');
  res.json(result.rows);
});

module.exports = router;
