import { Link } from 'react-router-dom';

export default function OrderSuccess() {
  return (
    <main className="success-page">
      <div className="success-card">
        <div className="success-icon">✅</div>
        <h1>Commande confirmée !</h1>
        <p>Merci pour ta commande. Tes abonnements digitaux sont maintenant actifs dans ton compte.</p>
        <div className="success-actions">
          <Link to="/compte" className="btn-primary">Voir mes abonnements</Link>
          <Link to="/" className="btn-secondary">Continuer les achats</Link>
        </div>
      </div>
    </main>
  );
}
