require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const subscriptionRoutes = require('./routes/subscriptions');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');
const { checkExpiringSubscriptions } = require('./services/notificationService');

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', name: 'LKM_BUSINESS API' }));

// Cron job: check expiring subscriptions every day at 8h00
cron.schedule('0 8 * * *', () => {
  console.log('Checking expiring subscriptions...');
  checkExpiringSubscriptions();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`LKM_BUSINESS API running on port ${PORT}`));
