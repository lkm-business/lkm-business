const router = require('express').Router();
const auth = require('../middleware/auth');

// GET /api/produits - tous les produits
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { type, categorie } = req.query;
    let query = `
      SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug,
        COALESCE(
          json_agg(f ORDER BY f.duree_jours) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) AS formules
      FROM produits p
      LEFT JOIN categories c ON p.categorie_id = c.id
      LEFT JOIN formules_iptv f ON f.produit_id = p.id AND f.est_actif = true
      WHERE p.est_actif = true
    `;
    const params = [];
    if (type) { params.push(type); query += ` AND p.type = $${params.length}`; }
    if (categorie) { params.push(categorie); query += ` AND c.slug = $${params.length}`; }
    query += ' GROUP BY p.id, c.nom, c.slug ORDER BY p.cree_le ASC';
    const r = await db.query(query, params);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// GET /api/produits/:slug - un produit
router.get('/:slug', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(`
      SELECT p.*, c.nom AS categorie_nom,
        COALESCE(
          json_agg(f ORDER BY f.duree_jours) FILTER (WHERE f.id IS NOT NULL),
          '[]'
        ) AS formules
      FROM produits p
      LEFT JOIN categories c ON p.categorie_id = c.id
      LEFT JOIN formules_iptv f ON f.produit_id = p.id
      WHERE p.slug = $1 AND p.est_actif = true
      GROUP BY p.id, c.nom
    `, [req.params.slug]);
    if (!r.rows.length) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
