const router = require('express').Router();
const auth = require('../middleware/auth');

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

// POST /api/paiements/cinetpay - Orange Money / Wave
router.post('/cinetpay', auth, async (req, res) => {
  const { montant, commande_id, description } = req.body;
  try {
    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: process.env.CINETPAY_API_KEY,
        site_id: process.env.CINETPAY_SITE_ID,
        transaction_id: commande_id,
        amount: montant,
        currency: 'XOF',
        description: description || 'Paiement LKM_BUSINESS',
        notify_url: `${process.env.FRONTEND_URL}/api/paiements/cinetpay/webhook`,
        return_url: `${process.env.FRONTEND_URL}/commande/succes`,
        cancel_url: `${process.env.FRONTEND_URL}/panier`,
        channels: 'ALL', // Orange Money + Wave + Mobile Money
        lang: 'fr',
        customer_id: req.user.id,
        customer_email: req.user.email,
      })
    });
    const data = await response.json();
    if (data.code === '201') {
      res.json({ url: data.data.payment_url });
    } else {
      res.status(400).json({ message: 'Erreur CinetPay', details: data });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erreur paiement mobile', error: err.message });
  }
});

// POST /api/paiements/cinetpay/webhook - notification CinetPay
router.post('/cinetpay/webhook', async (req, res) => {
  const { cpm_trans_id, cpm_result, cpm_amount } = req.body;
  try {
    const db = req.app.locals.db;
    if (cpm_result === '00') {
      await db.query(
        `UPDATE commandes SET statut='payee', statut_paiement='paye', reference_paiement=$1 WHERE numero=$2`,
        [cpm_trans_id, cpm_trans_id]
      );
    }
    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Erreur');
  }
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
