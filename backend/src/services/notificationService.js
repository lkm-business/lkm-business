const pool = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({ from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`, to, subject, html });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
}

async function checkExpiringSubscriptions() {
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  const start = new Date(twoDaysFromNow); start.setHours(0,0,0,0);
  const end = new Date(twoDaysFromNow); end.setHours(23,59,59,999);

  const result = await pool.query(`
    SELECT us.id, us.expiry_date, us.notified_2days,
           u.name, u.email,
           sp.name as plan_name, sp.icon
    FROM user_subscriptions us
    JOIN users u ON us.user_id = u.id
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.expiry_date BETWEEN $1 AND $2
      AND us.notified_2days = false
      AND us.status = 'active'
  `, [start, end]);

  for (const sub of result.rows) {
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <div style="background:#2DD4A7;padding:20px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#000;font-size:20px;margin:0">LKM_BUSINESS</h1>
          <p style="color:#064e3b;margin:4px 0;font-style:italic">Toi-même faut voir</p>
        </div>
        <div style="background:#fffbeb;border:1px solid #fbbf24;padding:20px;border-radius:0 0 8px 8px">
          <h2 style="color:#92400e">⚠️ Abonnement expirant bientôt</h2>
          <p>Bonjour <strong>${sub.name}</strong>,</p>
          <p>Ton abonnement <strong>${sub.icon} ${sub.plan_name}</strong> expire le <strong>${new Date(sub.expiry_date).toLocaleDateString('fr-FR')}</strong> (dans 2 jours).</p>
          <p>Pour continuer à profiter du service sans interruption, pense à renouveler depuis ton espace client.</p>
          <div style="text-align:center;margin:20px 0">
            <a href="${process.env.FRONTEND_URL}/account" style="background:#1D9E75;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:bold">Renouveler mon abonnement →</a>
          </div>
          <p style="color:#6b7280;font-size:12px">LKM_BUSINESS — Toi-même faut voir</p>
        </div>
      </div>
    `;
    await sendEmail(sub.email, `⚠️ Ton abonnement ${sub.plan_name} expire dans 2 jours`, html);
    await pool.query('UPDATE user_subscriptions SET notified_2days=true WHERE id=$1', [sub.id]);
  }
  console.log(`Notifications sent: ${result.rows.length}`);
}

module.exports = { checkExpiringSubscriptions, sendEmail };
