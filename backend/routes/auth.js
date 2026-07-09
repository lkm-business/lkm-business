const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// POST /api/auth/inscription
router.post('/inscription', async (req, res) => {
  const { nom, email, mot_de_passe, telephone } = req.body;
  if (!nom || !email || !mot_de_passe)
    return res.status(400).json({ message: 'Champs manquants' });
  try {
    const db = req.app.locals.db;
    const existe = await db.query('SELECT id FROM utilisateurs WHERE email=$1', [email]);
    if (existe.rows.length) return res.status(409).json({ message: 'Email déjà utilisé' });
    const hash = await bcrypt.hash(mot_de_passe, 12);
    const r = await db.query(
      'INSERT INTO utilisateurs (nom, email, mot_de_passe, telephone) VALUES ($1,$2,$3,$4) RETURNING id, nom, email, role',
      [nom, email, hash, telephone]
    );
    const user = r.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// POST /api/auth/connexion
router.post('/connexion', async (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe)
    return res.status(400).json({ message: 'Champs manquants' });
  try {
    const db = req.app.locals.db;
    const r = await db.query('SELECT * FROM utilisateurs WHERE email=$1', [email]);
    if (!r.rows.length) return res.status(401).json({ message: 'Identifiants incorrects' });
    const user = r.rows[0];
    if (!await bcrypt.compare(mot_de_passe, user.mot_de_passe))
      return res.status(401).json({ message: 'Identifiants incorrects' });
    if (user.est_actif === false)
      return res.status(403).json({ message: 'Compte désactivé. Contactez le support pour le réactiver.' });
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { mot_de_passe: _, ...safe } = user;
    res.json({ token, user: safe });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/auth/profil
router.get('/profil', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      'SELECT id, nom, email, telephone, adresse, photo, role, est_actif, cree_le FROM utilisateurs WHERE id=$1',
      [req.user.id]
    );
    if (!r.rows.length) return res.status(404).json({ message: 'Introuvable' });
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/auth/profil
router.put('/profil', auth, async (req, res) => {
  const { nom, telephone, adresse, photo } = req.body;
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      'UPDATE utilisateurs SET nom=$1, telephone=$2, adresse=$3, photo=$4, mis_a_jour_le=NOW() WHERE id=$5 RETURNING id, nom, email, telephone, adresse, photo, role, est_actif',
      [nom, telephone, adresse, photo, req.user.id]
    );
    res.json(r.rows[0]);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/auth/desactiver
router.post('/desactiver', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    await db.query('UPDATE utilisateurs SET est_actif=false, mis_a_jour_le=NOW() WHERE id=$1', [req.user.id]);
    res.json({ message: 'Compte désactivé' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
