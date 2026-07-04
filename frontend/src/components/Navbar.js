import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, deconnexion } = useAuth();
  const { nbArticles, setOpen } = useCart();
  const navigate = useNavigate();

  const handleCart = () => {
    if (!user) { navigate('/connexion?redirect=panier'); return; }
    setOpen(true);
  };

  return (
    <nav style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 24px', borderBottom:'0.5px solid #e5e5e5',
      background:'white', position:'sticky', top:0, zIndex:50
    }}>
      <Link to="/" style={{ textDecoration:'none', display:'flex', flexDirection:'column', lineHeight:1.1 }}>
        <span style={{ fontSize:16, fontWeight:600, letterSpacing:'1px', color:'#111' }}>
          LKM<span style={{ color:'#1D9E75' }}>_BUSINESS</span>
        </span>
        <span style={{ fontSize:10, color:'#888', fontStyle:'italic' }}>Toi-même faut voir</span>
      </Link>

      <div style={{ display:'flex', gap:4 }}>
        <Link to="/" style={linkStyle}>Boutique</Link>
        {user
          ? <Link to="/compte" style={linkStyle}>Mon compte</Link>
          : <Link to="/connexion" style={linkStyle}>Connexion</Link>
        }
        {user && (
          <button onClick={deconnexion} style={{ ...linkStyle, border:'none', cursor:'pointer', background:'none' }}>
            Déconnexion
          </button>
        )}
      </div>

      <button onClick={handleCart} style={{
        display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
        border:'0.5px solid #ddd', borderRadius:8, background:'white', cursor:'pointer', fontSize:13
      }}>
        🛒
        <span style={{
          background:'#1D9E75', color:'white', borderRadius:'50%',
          width:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11
        }}>{nbArticles}</span>
      </button>
    </nav>
  );
}

const linkStyle = {
  fontSize:13, color:'#555', textDecoration:'none', padding:'6px 10px', borderRadius:6
};
