const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  const [users, orders, subs, revenue] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM users'),
    pool.query("SELECT COUNT(*) FROM orders WHERE status != 'cancelled'"),
    pool.query("SELECT COUNT(*) FROM user_subscriptions WHERE status='active'"),
    pool.query("SELECT COALESCE(SUM(total),0) as total FROM orders WHERE payment_status='paid'"),
  ]);
  res.json({
    total_users: +users.rows[0].count,
    total_orders: +orders.rows[0].count,
    active_subscriptions: +subs.rows[0].count,
    total_revenue: +revenue.rows[0].total,
  });
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  const result = await pool.query(`
    SELECT o.*, u.name as user_name, u.email as user_email
    FROM orders o JOIN users u ON o.user_id=u.id
    ORDER BY o.created_at DESC LIMIT 100
  `);
  res.json(result.rows);
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  const { status, payment_status } = req.body;
  const result = await pool.query(
    'UPDATE orders SET status=$1, payment_status=$2, updated_at=NOW() WHERE id=$3 RETURNING *',
    [status, payment_status, req.params.id]
  );
  res.json(result.rows[0]);
});

module.exports = router;
