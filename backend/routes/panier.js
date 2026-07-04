const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `SELECT pan.*, p.nom, p.prix, p.type, p.image_principale, f.duree_label, f.prix AS prix_formule, f.duree_jours
       FROM panier pan
       JOIN produits p ON p.id = pan.produit_id
       LEFT JOIN formules_iptv f ON f.id = pan.formule_iptv_id
       WHERE pan.utilisateur_id = $1`,
      [req.user.id]
    );
    res.json(r.rows);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
});

router.post('/', auth, async (req, res) => {
  const { produit_id, formule_iptv_id, quantite } = req.body;
  try {
    const db = req.app.locals.db;
    await db.query(
      `INSERT INTO panier (utilisateur_id, produit_id, formule_iptv_id, quantite)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (utilisateur_id, produit_id, formule_iptv_id)
       DO UPDATE SET quantite = panier.quantite + $4`,
      [req.user.id, produit_id, formule_iptv_id || null, quantite || 1]
    );
    res.status(201).json({ message: 'Ajouté au panier' });
  } catch (err) { res.status(500).json({ message: 'Erreur serveur', error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query('DELETE FROM panier WHERE id=$1 AND utilisateur_id=$2', [req.params.id, req.user.id]);
    res.json({ message: 'Article retiré' });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
});

router.delete('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query('DELETE FROM panier WHERE utilisateur_id=$1', [req.user.id]);
    res.json({ message: 'Panier vidé' });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
});

module.exports = router;
