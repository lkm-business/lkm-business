const express = require('express');
const { query } = require('../database/db');
const { auth } = require('../middleware/auth');
const router = express.Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await query('SELECT id,name,email,phone,role,created_at FROM users WHERE id=$1', [req.user.id]);
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

// PUT /api/users/profile
router.put('/profile', auth, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const result = await query('UPDATE users SET name=$1, phone=$2, updated_at=NOW() WHERE id=$3 RETURNING id,name,email,phone', [name, phone, req.user.id]);
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

// GET /api/users/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    res.json(result.rows);
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

// PUT /api/users/notifications/read
router.put('/notifications/read', auth, async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read=true WHERE user_id=$1', [req.user.id]);
    res.json({ message: 'Notifications marquées comme lues' });
  } catch { res.status(500).json({ error: 'Erreur serveur' }); }
});

module.exports = router;
