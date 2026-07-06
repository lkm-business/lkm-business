import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{background: '#0F6E56', color: 'white', marginTop: 40}}>
      <div style={{
        maxWidth: 1100, margin: '0 auto', padding: '32px 24px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24
      }}>
        <div>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 6}}>LKM<span style={{color: '#2DD4A7'}}>_BUSINESS</span></div>
          <div style={{fontSize: 12, opacity: 0.8, fontStyle: 'italic'}}>Toi-même faut voir</div>
        </div>
        <div>
          <div style={{fontSize: 12, fontWeight: 600, marginBottom: 10, opacity: 0.9}}>Boutique</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <Link to="/" style={linkStyle}>Tous les produits</Link>
            <Link to="/?cat=iptv" style={linkStyle}>IPTV</Link>
          </div>
        </div>
        <div>
          <div style={{fontSize: 12, fontWeight: 600, marginBottom: 10, opacity: 0.9}}>Compte</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
            <Link to="/compte" style={linkStyle}>Mon compte</Link>
            <Link to="/connexion" style={linkStyle}>Connexion</Link>
          </div>
        </div>
        <div>
          <div style={{fontSize: 12, fontWeight: 600, marginBottom: 10, opacity: 0.9}}>Contact</div>
          <div style={{fontSize: 12, opacity: 0.8, lineHeight: 1.8, marginBottom: 10}}>
            <Link to="/contact" style={linkStyle}>contact@lkmbusiness.com</Link><br />
            Paiement : Orange Money, Wave, Stripe
          </div>
          <div style={{display: 'flex', gap: 12}}>
            <a href="https://www.tiktok.com/@lkm_suarl" target="_blank" rel="noopener noreferrer" style={socialStyle} aria-label="TikTok">🎵</a>
            <a href="https://wa.me/message/VK75NLUQCZUIJ1" target="_blank" rel="noopener noreferrer" style={socialStyle} aria-label="WhatsApp">💬</a>
            <a href="https://www.snapchat.com/add/ns-jusse" target="_blank" rel="noopener noreferrer" style={socialStyle} aria-label="Snapchat">👻</a>
          </div>
        </div>
      </div>
      <div style={{borderTop: '1px solid rgba(255,255,255,0.15)', textAlign: 'center', padding: '14px', fontSize: 11, opacity: 0.7}}>
        © {new Date().getFullYear()} LKM_BUSINESS — Tous droits réservés
      </div>
    </footer>
  );
}

const linkStyle = { fontSize: 12, color: 'rgba(255,255,255,0.8)', textDecoration: 'none' };
const socialStyle = { fontSize: 18, textDecoration: 'none', color: 'white', background: 'rgba(255,255,255,0.12)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
