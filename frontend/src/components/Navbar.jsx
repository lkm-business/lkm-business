import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logoImg from '../assets/logo.jpg';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, setIsOpen } = useCart();
  const navigate = useNavigate();

  const handleCart = () => {
    if (!user) { navigate('/account?redirect=cart'); return; }
    setIsOpen(true);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo-wrap">
        <img src={logoImg} alt="LKM_BUSINESS" className="logo-img" />
        <div>
          <span className="logo-name">LKM<span>_BUSINESS</span></span>
          <span className="logo-slogan">Toi-même faut voir</span>
        </div>
      </Link>
      <div className="nav-links">
        <Link to="/" className="nav-link">Boutique</Link>
        <Link to="/account" className="nav-link">Mon compte</Link>
      </div>
      <div className="nav-right">
        <button className="cart-btn" onClick={handleCart}>
          🛒 <span className="cart-badge">{count}</span>
        </button>
      </div>
    </nav>
  );
}
