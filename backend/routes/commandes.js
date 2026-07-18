const router = require('express').Router();
const auth = require('../middleware/auth');
const authOptionnelle = require('../middleware/authOptionnelle');
const { notifierWhatsApp } = require('../services/whatsapp');
const { notifierEmail } = require('../services/email');

// POST /api/commandes - créer une commande (avec ou sans compte)
router.post('/', authOptionnelle, async (req, res) => {
  const { articles, methode_paiement, adresse_livraison, client } = req.body;
  if (!articles || !articles.length)
    return res.status(400).json({ message: 'Panier vide' });
  if (!req.user && (!client?.nom?.trim() || !client?.telephone?.trim()))
    return res.status(400).json({ message: 'Nom et téléphone requis pour commander sans compte' });

  const db = req.app.locals.db;
  const dbClient = await db.connect();
  try {
    await dbClient.query('BEGIN');
    const montant_total = articles.reduce((s, a) => s + a.prix * (a.quantite || 1), 0);
    const numero = 'LKM-' + Date.now();
    const livraison = req.user ? (adresse_livraison || {}) : { ...(adresse_livraison || {}), client };
    const cmd = await dbClient.query(
      `INSERT INTO commandes (numero, utilisateur_id, montant_total, methode_paiement, adresse_livraison)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [numero, req.user?.id || null, montant_total, methode_paiement, JSON.stringify(livraison)]
    );
    const commande = cmd.rows[0];

    for (const art of articles) {
      await dbClient.query(
        `INSERT INTO lignes_commande (commande_id, produit_id, formule_iptv_id, nom_produit, quantite, prix_unitaire, sous_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [commande.id, art.produit_id, art.formule_iptv_id || null, art.nom, art.quantite || 1, art.prix, art.prix * (art.quantite || 1)]
      );

      // Créer les abonnements pour produits numériques
      if (art.type === 'numerique') {
        const duree = art.duree_jours || 30;
        await dbClient.query(
          `INSERT INTO abonnements (utilisateur_id, commande_id, produit_id, formule_iptv_id, nom_abonnement, date_debut, date_expiration)
           VALUES ($1,$2,$3,$4,$5, NOW(), NOW() + INTERVAL '${duree} days')`,
          [req.user?.id || null, commande.id, art.produit_id, art.formule_iptv_id || null, art.nom]
        );
      }
    }

    await dbClient.query('COMMIT');

    // Notifier l'admin : toujours pour les commandes sans compte (à valider/préparer manuellement),
    // et pour toute commande contenant des produits numériques (accès à créer)
    const numeriques = articles.filter(a => a.type === 'numerique');
    const estInvite = !req.user;
    if (estInvite || numeriques.length > 0) {
      const contact = estInvite
        ? `Client (sans compte) : ${client.nom} — 📞 ${client.telephone}${client.email ? ' — ' + client.email : ''}`
        : `Client : ${req.user.email}`;
      const liste = articles.map(a => `- ${a.nom} x${a.quantite || 1}`).join('\n');
      const adresseTxt = adresse_livraison?.adresse ? `\nAdresse: ${adresse_livraison.adresse}` : '';
      const message = `🔔 Nouvelle commande LKM_BUSINESS #${commande.numero}\n${contact}\n${liste}\nTotal: ${montant_total} FCFA\nPaiement: ${methode_paiement}${adresseTxt}\n→ Vérifier le paiement et préparer${numeriques.length ? '/créer les accès' : ' la commande'}.`;
      notifierWhatsApp(message);
      notifierEmail(`Nouvelle commande #${commande.numero}${estInvite ? ' (sans compte)' : ''}`, message);
    }

    res.status(201).json({ commande, message: 'Commande créée avec succès' });
  } catch (err) {
    await dbClient.query('ROLLBACK');
    res.status(500).json({ message: 'Erreur lors de la commande', error: err.message });
  } finally {
    dbClient.release();
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
