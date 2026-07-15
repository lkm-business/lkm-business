require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// BASE DE DONNÉES
// ============================================
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.connect()
  .then(() => console.log('✅ PostgreSQL connecté'))
  .catch(err => console.error('❌ Erreur PostgreSQL:', err));

// Rendre pool accessible aux routes
app.locals.db = pool;

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/produits',  require('./routes/produits'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/abonnements', require('./routes/abonnements'));
app.use('/api/paiements', require('./routes/paiements'));
app.use('/api/panier',    require('./routes/panier'));
app.use('/api/avis',      require('./routes/avis'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LKM_BUSINESS API opérationnelle' });
});

// Diagnostic temporaire : IP de sortie du serveur (pour la liste blanche CinetPay)
app.get('/api/health/ip-sortante', async (req, res) => {
  try {
    const r = await fetch('https://api.ipify.org?format=json');
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// CRON: Notifications expiration (tous les jours à 8h)
// ============================================
cron.schedule('0 8 * * *', async () => {
  console.log('🔔 Vérification des abonnements expirant...');
  try {
    const { sendExpirationEmails } = require('./controllers/notificationsController');
    await sendExpirationEmails(pool);
  } catch (err) {
    console.error('Erreur cron notifications:', err);
  }
});

// ============================================
// DÉMARRAGE
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Serveur LKM_BUSINESS démarré sur le port ${PORT}`);
});

module.exports = app;
