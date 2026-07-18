const router = require('express').Router();
const auth = require('../middleware/auth');
const authOptionnelle = require('../middleware/authOptionnelle');

// POST /api/paiements/stripe - paiement carte bancaire
router.post('/stripe', auth, async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { montant, commande_id, email } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'xof',
          product_data: { name: 'Commande LKM_BUSINESS #' + commande_id },
          unit_amount: Math.round(montant),
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.FRONTEND_URL}/commande/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/panier`,
      metadata: { commande_id }
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: 'Erreur Stripe', error: err.message });
  }
});

// Authentification CinetPay (API v1) — jeton mis en cache jusqu'à expiration
let cinetpayToken = null;
let cinetpayTokenExpiry = 0;

async function getCinetpayToken() {
  if (cinetpayToken && Date.now() < cinetpayTokenExpiry) return cinetpayToken;
  const r = await fetch(`${process.env.CINETPAY_BASE_URL}/v1/oauth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.CINETPAY_API_KEY,
      api_password: process.env.CINETPAY_API_PASSWORD,
    }),
  });
  const data = await r.json();
  if (data.code !== 200 || !data.access_token)
    throw new Error('Authentification CinetPay échouée');
  cinetpayToken = data.access_token;
  cinetpayTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cinetpayToken;
}

const splitNom = (nom) => {
  const parts = (nom || 'Client LKM').trim().split(/\s+/);
  let prenom = parts[0] || 'Client';
  let nomFamille = parts.slice(1).join(' ') || parts[0] || 'LKM';
  if (prenom.length < 2) prenom = (prenom + 'XX').slice(0, 2);
  if (nomFamille.length < 2) nomFamille = (nomFamille + 'XX').slice(0, 2);
  return { prenom, nomFamille };
};

// POST /api/paiements/cinetpay - Wave / Orange Money / Carte, en une seule page de paiement
router.post('/cinetpay', authOptionnelle, async (req, res) => {
  const { montant, commande_id, description, client } = req.body;
  try {
    let prenom, nomFamille, email;
    if (req.user) {
      const db = req.app.locals.db;
      const u = await db.query('SELECT nom FROM utilisateurs WHERE id=$1', [req.user.id]);
      ({ prenom, nomFamille } = splitNom(u.rows[0]?.nom));
      email = req.user.email;
    } else {
      if (!client?.email) return res.status(400).json({ message: 'Email requis pour le paiement en ligne' });
      ({ prenom, nomFamille } = splitNom(client.nom));
      email = client.email;
    }

    const token = await getCinetpayToken();
    const merchantTransactionId = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

    const response = await fetch(`${process.env.CINETPAY_BASE_URL}/v1/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        currency: 'XOF',
        merchant_transaction_id: merchantTransactionId,
        amount: Math.round(montant),
        lang: 'fr',
        designation: description || `Commande LKM_BUSINESS #${commande_id}`,
        client_email: email,
        client_first_name: prenom,
        client_last_name: nomFamille,
        success_url: `${process.env.FRONTEND_URL}/commande/succes`,
        failed_url: `${process.env.FRONTEND_URL}/checkout`,
        notify_url: `${process.env.BACKEND_URL}/api/paiements/cinetpay/webhook`,
      }),
    });
    const data = await response.json();
    if (data.code === 200 && data.payment_url) {
      res.json({ url: data.payment_url });
    } else {
      res.status(400).json({ message: 'Erreur CinetPay', details: data });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur paiement', error: err.message });
  }
});

// POST /api/paiements/cinetpay/webhook - notification CinetPay
router.post('/cinetpay/webhook', async (req, res) => {
  console.log('🔔 Notification CinetPay reçue:', JSON.stringify(req.body));
  res.status(200).send('OK');
});

// POST /api/paiements/stripe/webhook
router.post('/stripe/webhook', async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send('Webhook error: ' + err.message);
  }
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const db = req.app.locals.db;
    await db.query(
      `UPDATE commandes SET statut='payee', statut_paiement='paye', reference_paiement=$1 WHERE id=$2`,
      [session.payment_intent, session.metadata.commande_id]
    );
  }
  res.json({ received: true });
});

module.exports = router;
