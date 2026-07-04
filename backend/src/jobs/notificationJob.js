const pool = require('../config/db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

async function sendMail({ to, subject, html }) {
  await transporter.sendMail({
    from: `"LKM_BUSINESS" <${process.env.EMAIL_USER}>`,
    to, subject, html,
  });
}

async function checkExpiringSubscriptions() {
  try {
    // Abonnements qui expirent dans exactement 2 jours, notif pas encore envoyée
    const { rows } = await pool.query(`
      SELECT s.id, s.product_name, s.expiry_date, s.user_id,
             u.name, u.email
      FROM subscriptions s
      JOIN users u ON s.user_id = u.id
      WHERE s.status = 'active'
        AND s.notif_sent_2d = false
        AND s.expiry_date BETWEEN NOW() + INTERVAL '1 day 23 hours'
                              AND NOW() + INTERVAL '2 days 1 hour'
    `);

    for (const sub of rows) {
      const expiryStr = new Date(sub.expiry_date).toLocaleDateString('fr-FR');

      // Email de notification
      await sendMail({
        to: sub.email,
        subject: `⚠️ Ton abonnement ${sub.product_name} expire dans 2 jours`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#2DD4A7;padding:20px;text-align:center">
              <h1 style="color:#0F6E56;margin:0">LKM_BUSINESS</h1>
              <p style="color:#0F6E56;font-style:italic;margin:4px 0">Toi-même faut voir</p>
            </div>
            <div style="padding:24px;background:#f9f9f9">
              <p>Bonjour <strong>${sub.name}</strong>,</p>
              <p>Ton abonnement <strong>${sub.product_name}</strong> expire le <strong>${expiryStr}</strong>.</p>
              <p>Renouvelle maintenant pour ne pas perdre l'accès à tes contenus !</p>
              <div style="text-align:center;margin:24px 0">
                <a href="${process.env.FRONTEND_URL}/compte/abonnements"
                   style="background:#1D9E75;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
                  Renouveler mon abonnement
                </a>
              </div>
              <p style="font-size:12px;color:#999">LKM_BUSINESS — Toi-même faut voir</p>
            </div>
          </div>
        `,
      });

      // Notification en base
      await pool.query(
        `INSERT INTO notifications (user_id, type, message) VALUES ($1, 'expiry_warning', $2)`,
        [sub.user_id, `Ton abonnement ${sub.product_name} expire le ${expiryStr}. Pense à renouveler !`]
      );

      // Marquer comme envoyée
      await pool.query('UPDATE subscriptions SET notif_sent_2d=true WHERE id=$1', [sub.id]);

      console.log(`Email envoyé à ${sub.email} pour ${sub.product_name}`);
    }

    console.log(`${rows.length} notification(s) d'expiration envoyée(s)`);
  } catch (err) {
    console.error('Erreur notification job:', err.message);
  }
}

module.exports = { checkExpiringSubscriptions };
