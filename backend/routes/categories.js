const router = require('express').Router();

// GET /api/categories - toutes les catégories
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query('SELECT * FROM categories ORDER BY nom ASC');
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
