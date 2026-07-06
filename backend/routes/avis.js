const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/avis - liste des avis clients
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `SELECT a.id, a.note, a.commentaire, a.cree_le, u.nom
       FROM avis a
       JOIN utilisateurs u ON u.id = a.utilisateur_id
       ORDER BY a.cree_le DESC
       LIMIT 20`
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/avis - laisser un avis
router.post('/', auth, async (req, res) => {
  const { note, commentaire } = req.body;
  if (!note || note < 1 || note > 5) return res.status(400).json({ message: 'Note invalide' });
  if (!commentaire || !commentaire.trim()) return res.status(400).json({ message: 'Commentaire requis' });
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `INSERT INTO avis (utilisateur_id, note, commentaire) VALUES ($1,$2,$3) RETURNING id, note, commentaire, cree_le`,
      [req.user.id, note, commentaire.trim()]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

module.exports = router;
