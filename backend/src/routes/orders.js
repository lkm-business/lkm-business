const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/orders — créer une commande
router.post('/', authMiddleware, async (req, res) => {
  const { items, payment_method, delivery_address, notes } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'Panier vide' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const total = items.reduce((s, i) => s + i.unit_price * (i.quantity || 1), 0);
    const order = await client.query(
      'INSERT INTO orders (user_id, total, payment_method, delivery_address, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.user.id, total, payment_method, delivery_address, notes]
    );
    const orderId = order.rows[0].id;
    const now = new Date();
    for (const item of items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, plan_id, quantity, unit_price, item_type) VALUES ($1,$2,$3,$4,$5,$6)',
        [orderId, item.product_id || null, item.plan_id || null, item.quantity || 1, item.unit_price, item.item_type]
      );
      if (item.item_type === 'subscription' && item.plan_id) {
        const plan = await client.query('SELECT * FROM subscription_plans WHERE id=$1', [item.plan_id]);
        if (plan.rows.length) {
          const expiry = new Date(now);
          expiry.setDate(expiry.getDate() + plan.rows[0].duration_days);
          await client.query(
            'INSERT INTO user_subscriptions (user_id, plan_id, order_id, expiry_date) VALUES ($1,$2,$3,$4)',
            [req.user.id, item.plan_id, orderId, expiry]
          );
        }
      }
    }
    await client.query('COMMIT');
    res.status(201).json({ order: order.rows[0], message: 'Commande créée' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erreur commande', detail: err.message });
  } finally {
    client.release();
  }
});

// GET /api/orders/my
router.get('/my', authMiddleware, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]
  );
  res.json(result.rows);
});

module.exports = router;
