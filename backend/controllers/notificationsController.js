const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

async function sendExpirationEmails(db) {
  // Trouver abonnements qui expirent dans exactement 2 jours et notif pas encore envoyée
  const result = await db.query(`
    SELECT a.id, a.nom_abonnement, a.date_expiration,
           u.nom, u.email
    FROM abonnements a
    JOIN utilisateurs u ON u.id = a.utilisateur_id
    WHERE a.statut = 'actif'
      AND a.notif_2j_envoyee = false
      AND a.date_expiration BETWEEN NOW() + INTERVAL '1 day 23 hours' AND NOW() + INTERVAL '2 days 1 hour'
  `);

  for (const abo of result.rows) {
    try {
      await transporter.sendMail({
        from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
        to: abo.email,
        subject: `⚠️ Votre abonnement ${abo.nom_abonnement} expire dans 2 jours`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px">
            <div style="background:#2DD4A7;padding:20px;border-radius:10px;text-align:center;margin-bottom:20px">
              <h1 style="color:#0F6E56;margin:0;font-size:22px">LKM_BUSINESS</h1>
              <p style="color:#085041;margin:4px 0;font-style:italic;font-size:13px">Toi-même faut voir</p>
            </div>
            <h2 style="color:#333">Bonjour ${abo.nom} 👋</h2>
            <p style="color:#555;line-height:1.6">
              Votre abonnement <strong>${abo.nom_abonnement}</strong> expire le
              <strong>${new Date(abo.date_expiration).toLocaleDateString('fr-FR')}</strong>,
              soit dans <strong>2 jours</strong>.
            </p>
            <p style="color:#555">Pour continuer à profiter du service sans interruption, renouvelez dès maintenant.</p>
            <div style="text-align:center;margin:30px 0">
              <a href="${process.env.FRONTEND_URL}/compte/abonnements"
                 style="background:#1D9E75;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block">
                Renouveler mon abonnement
              </a>
            </div>
            <p style="color:#888;font-size:12px;text-align:center">
              LKM_BUSINESS • Toi-même faut voir
            </p>
          </div>
        `
      });

      // Marquer la notification comme envoyée
      await db.query(
        'UPDATE abonnements SET notif_2j_envoyee=true WHERE id=$1',
        [abo.id]
      );

      console.log(`✅ Email envoyé à ${abo.email} pour ${abo.nom_abonnement}`);
    } catch (err) {
      console.error(`❌ Erreur email pour ${abo.email}:`, err.message);
    }
  }

  console.log(`📧 ${result.rows.length} notification(s) traitée(s)`);
}

module.exports = { sendExpirationEmails };
