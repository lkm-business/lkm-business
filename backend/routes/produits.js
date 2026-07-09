const router = require('express').Router();
const auth = require('../middleware/auth');
const estAdmin = require('../middleware/estAdmin');

const slugify = (s) => s.toString().toLowerCase().trim()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// GET /api/produits/admin/tous - tous les produits (admin, y compris inactifs)
router.get('/admin/tous', auth, estAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(`
      SELECT p.*, c.nom AS categorie_nom, c.slug AS categorie_slug
      FROM produits p
      LEFT JOIN categories c ON p.categorie_id = c.id
      ORDER BY p.cree_le DESC
    `);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/produits - créer un produit (admin)
router.post('/', auth, estAdmin, async (req, res) => {
  const { nom, description, prix, type, categorie_id, image_principale, stock } = req.body;
  if (!nom || !prix || !type)
    return res.status(400).json({ message: 'Champs manquants' });
  try {
    const db = req.app.locals.db;
    const slug = slugify(nom);
    const r = await db.query(
      `INSERT INTO produits (nom, slug, description, prix, type, categorie_id, image_principale, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nom, slug, description || null, prix, type, categorie_id || null, image_principale || null, stock || 0]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// PUT /api/produits/:id - modifier un produit (admin)
router.put('/:id', auth, estAdmin, async (req, res) => {
  const { nom, description, prix, prix_promo, type, categorie_id, image_principale, stock, est_actif } = req.body;
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `UPDATE produits SET
        nom = COALESCE($1, nom),
        description = COALESCE($2, description),
        prix = COALESCE($3, prix),
        prix_promo = $4,
        type = COALESCE($5, type),
        categorie_id = COALESCE($6, categorie_id),
        image_principale = COALESCE($7, image_principale),
        stock = COALESCE($8, stock),
        est_actif = COALESCE($9, est_actif)
       WHERE id = $10 RETURNING *`,
      [nom, description, prix, prix_promo ?? null, type, categorie_id, image_principale, stock, est_actif, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ message: 'Produit introuvable' });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// DELETE /api/produits/:id - désactiver un produit (admin, suppression douce)
router.delete('/:id', auth, estAdmin, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query('UPDATE produits SET est_actif = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Produit désactivé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

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
