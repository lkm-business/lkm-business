import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, deconnexion } = useAuth();
  const { nbArticles, setOpen } = useCart();
  const navigate = useNavigate();
  const [promoOpen, setPromoOpen] = useState(true);
  const [search, setSearch] = useState('');

  const handleCart = () => {
    if (!user) { navigate('/connexion?redirect=panier'); return; }
    setOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(search.trim() ? `/?q=${encodeURIComponent(search.trim())}` : '/');
  };

  return (
    <div>
      {promoOpen && (
        <div style={{background: '#E1F5EE', color: '#0F6E56', fontSize: 12, fontWeight: 500, textAlign: 'center', padding: '7px 32px', position: 'relative'}}>
          🎉 Livraison gratuite dès 50 000 FCFA d'achat — Paiement sécurisé Orange Money, Wave & Stripe
          <button onClick={() => setPromoOpen(false)} style={{position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#0F6E56', fontSize: 13}}>✕</button>
        </div>
      )}

      <nav className="navbar-main" style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', background: 'white', borderBottom: '0.5px solid #e5e5e5', flexWrap: 'wrap'}}>
        <Link to="/" className="navbar-logo" style={{textDecoration: 'none', display: 'flex', flexDirection: 'column', lineHeight: 1.1, flexShrink: 0}}>
          <span style={{fontSize: 24, fontWeight: 700, letterSpacing: '0.5px', color: '#111'}}>LKM<span style={{color: '#1D9E75'}}>_BUSINESS</span></span>
          <span style={{fontSize: 10, color: '#888', fontStyle: 'italic'}}>Toi-même faut voir</span>
        </Link>

        <form onSubmit={handleSearch} className="navbar-search" style={{flex: 1, minWidth: 180, maxWidth: 480, margin: '0 auto', position: 'relative'}}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit, une marque..."
            style={{width: '100%', padding: '9px 14px 9px 36px', border: '1px solid #ddd', borderRadius: 24, fontSize: 13, outline: 'none', boxSizing: 'border-box'}}
          />
          <span style={{position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#999'}}>🔎</span>
        </form>

        <div className="navbar-icons" style={{display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0}}>
          <Link to={user ? '/compte' : '/connexion'} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#333', fontSize: 10, gap: 2}}>
            <span style={{fontSize: 18}}>👤</span>
            {user ? 'Compte' : 'Connexion'}
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#1D9E75', fontSize: 10, gap: 2, fontWeight: 600}}>
              <span style={{fontSize: 18}}>🛠️</span>
              Admin
            </Link>
          )}
          {user && (
            <button onClick={deconnexion} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#999'}}>Déconnexion</button>
          )}
          <button onClick={handleCart} style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#333', gap: 2}}>
            <span style={{fontSize: 18}}>🛒</span>
            Panier
            <span style={{position: 'absolute', top: -4, right: -10, background: '#1D9E75', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{nbArticles}</span>
          </button>
        </div>
      </nav>

      <div className="navbar-catrow" style={{display: 'flex', alignItems: 'center', gap: 24, padding: '8px 24px', background: 'white', borderBottom: '0.5px solid #e5e5e5', overflow: 'visible', flexWrap: 'wrap'}}>
        <Link to="/" style={navLinkStyle}>Accueil</Link>

        <div className="nav-dropdown">
          <span style={navLinkStyle}>Produits physiques ▾</span>
          <div className="nav-dropdown-menu">
            <Link to="/produits#montres" style={dropdownItemStyle}>Montres connectées</Link>
            <Link to="/produits#audio" style={dropdownItemStyle}>Audio (JBL + AirPods)</Link>
            <Link to="/produits#accessoires" style={dropdownItemStyle}>Accessoires</Link>
          </div>
        </div>

        <div className="nav-dropdown">
          <span style={navLinkStyle}>Abonnements & IPTV ▾</span>
          <div className="nav-dropdown-menu">
            <Link to="/abonnements#streaming" style={dropdownItemStyle}>Streaming (Netflix, Prime, Crunchyroll, Apple Music)</Link>
            <Link to="/abonnements#iptv-premium" style={dropdownItemStyle}>IPTV Premium</Link>
            <Link to="/abonnements#iptv-ultra-premium" style={dropdownItemStyle}>IPTV Ultra Premium</Link>
          </div>
        </div>

        <Link to="/contact" style={navLinkStyle}>Contact</Link>
      </div>
    </div>
  );
}

const navLinkStyle = {fontSize: 13, fontWeight: 500, color: '#333', textDecoration: 'none', whiteSpace: 'nowrap', cursor: 'default'};
const dropdownItemStyle = {display: 'block', padding: '8px 12px', fontSize: 12, color: '#333', textDecoration: 'none', borderRadius: 6, whiteSpace: 'nowrap'};
