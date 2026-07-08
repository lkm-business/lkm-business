const router = require('express').Router();
const auth = require('../middleware/auth');
const { notifierWhatsApp } = require('../services/whatsapp');
const { notifierEmail } = require('../services/email');

// POST /api/commandes - créer une commande
router.post('/', auth, async (req, res) => {
  const { articles, methode_paiement, adresse_livraison } = req.body;
  if (!articles || !articles.length)
    return res.status(400).json({ message: 'Panier vide' });
  const db = req.app.locals.db;
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const montant_total = articles.reduce((s, a) => s + a.prix * (a.quantite || 1), 0);
    const numero = 'LKM-' + Date.now();
    const cmd = await client.query(
      `INSERT INTO commandes (numero, utilisateur_id, montant_total, methode_paiement, adresse_livraison)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [numero, req.user.id, montant_total, methode_paiement, JSON.stringify(adresse_livraison)]
    );
    const commande = cmd.rows[0];

    for (const art of articles) {
      await client.query(
        `INSERT INTO lignes_commande (commande_id, produit_id, formule_iptv_id, nom_produit, quantite, prix_unitaire, sous_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [commande.id, art.produit_id, art.formule_iptv_id || null, art.nom, art.quantite || 1, art.prix, art.prix * (art.quantite || 1)]
      );

      // Créer les abonnements pour produits numériques
      if (art.type === 'numerique') {
        const duree = art.duree_jours || 30;
        await client.query(
          `INSERT INTO abonnements (utilisateur_id, commande_id, produit_id, formule_iptv_id, nom_abonnement, date_debut, date_expiration)
           VALUES ($1,$2,$3,$4,$5, NOW(), NOW() + INTERVAL '${duree} days')`,
          [req.user.id, commande.id, art.produit_id, art.formule_iptv_id || null, art.nom]
        );
      }
    }

    await client.query('COMMIT');

    // Notifier l'admin sur WhatsApp si la commande contient des produits numériques (accès à créer)
    const numeriques = articles.filter(a => a.type === 'numerique');
    if (numeriques.length > 0) {
      const liste = numeriques.map(a => `- ${a.nom}`).join('\n');
      const message = `🔔 Nouvelle commande LKM_BUSINESS #${commande.numero}\n${liste}\nTotal: ${montant_total} FCFA\nPaiement: ${methode_paiement}\nClient: ${req.user.email}\n→ Vérifier le paiement et créer les accès.`;
      notifierWhatsApp(message);
      notifierEmail(`Nouvelle commande #${commande.numero} — accès à créer`, message);
    }

    res.status(201).json({ commande, message: 'Commande créée avec succès' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erreur lors de la commande', error: err.message });
  } finally {
    client.release();
  }
});

// GET /api/commandes - mes commandes
router.get('/', auth, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const r = await db.query(
      `SELECT c.*, json_agg(l) AS articles
       FROM commandes c
       LEFT JOIN lignes_commande l ON l.commande_id = c.id
       WHERE c.utilisateur_id = $1
       GROUP BY c.id ORDER BY c.cree_le DESC`,
      [req.user.id]
    );
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
