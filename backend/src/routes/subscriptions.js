const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// GET /api/subscriptions/my — liste abonnements utilisateur
router.get('/my', authMiddleware, async (req, res) => {
  const result = await pool.query(`
    SELECT us.*, sp.name, sp.icon, sp.type, sp.description
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = $1
    ORDER BY us.created_at DESC
  `, [req.user.id]);
  res.json(result.rows);
});

// POST /api/subscriptions/renew/:id
router.post('/renew/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const sub = await pool.query('SELECT * FROM user_subscriptions WHERE id=$1 AND user_id=$2', [id, req.user.id]);
  if (!sub.rows.length) return res.status(404).json({ error: 'Abonnement introuvable' });
  const s = sub.rows[0];
  const base = new Date(s.expiry_date) > new Date() ? new Date(s.expiry_date) : new Date();
  base.setDate(base.getDate() + 30);
  await pool.query('UPDATE user_subscriptions SET expiry_date=$1, notified_2days=false WHERE id=$2', [base, id]);
  res.json({ message: 'Abonnement renouvelé', new_expiry: base });
});

module.exports = router;
