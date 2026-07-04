const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/abonnements - mes abonnements
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `SELECT a.*, p.nom AS produit_nom, p.image_principale,
        EXTRACT(DAY FROM (a.date_expiration - NOW())) AS jours_restants
       FROM abonnements a
       LEFT JOIN produits p ON p.id = a.produit_id
       WHERE a.utilisateur_id = $1
       ORDER BY a.date_expiration ASC`,
      [req.user.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/abonnements/:id/renouveler
router.post('/:id/renouveler', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `UPDATE abonnements
       SET date_expiration = GREATEST(date_expiration, NOW()) + INTERVAL '30 days',
           statut = 'actif',
           notif_2j_envoyee = false
       WHERE id = $1 AND utilisateur_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    if (!r.rows.length) return res.status(404).json({ message: 'Abonnement introuvable' });
    res.json({ message: 'Abonnement renouvelé', abonnement: r.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
