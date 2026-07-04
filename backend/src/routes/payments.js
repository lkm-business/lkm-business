const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

// POST /api/payments/stripe/create-intent
router.post('/stripe/create-intent', authMiddleware, async (req, res) => {
  const { amount, currency = 'xof' } = req.body;
  try {
    const intent = await stripe.paymentIntents.create({ amount: Math.round(amount), currency });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/orange-money/initiate
router.post('/orange-money/initiate', authMiddleware, async (req, res) => {
  const { amount, phone, order_id } = req.body;
  // Intégration Orange Money Sénégal — nécessite compte marchand OrangeMoney API
  // Documentation: https://developer.orange.com/apis/om-webpay-sen
  res.json({
    message: 'Orange Money — intégration à configurer avec votre compte marchand',
    docs: 'https://developer.orange.com/apis/om-webpay-sen',
    required: ['merchant_key', 'merchant_secret', 'phone', 'amount', 'order_id']
  });
});

// POST /api/payments/wave/initiate  
router.post('/wave/initiate', authMiddleware, async (req, res) => {
  const { amount, order_id } = req.body;
  // Intégration Wave Sénégal — nécessite compte marchand Wave Business
  // Documentation: https://www.wave.com/en/business/api/
  res.json({
    message: 'Wave — intégration à configurer avec votre compte Wave Business',
    docs: 'https://www.wave.com/en/business/api/',
    required: ['api_key', 'amount', 'order_id', 'callback_url']
  });
});

module.exports = router;
