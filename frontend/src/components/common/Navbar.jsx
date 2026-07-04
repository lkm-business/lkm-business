import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const handleCart = () => {
    if (!user) {
      navigate('/connexion?from=/commander');
      return;
    }
    setCartOpen(true);
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="nav-logo">
          <img src="/logo.png" alt="LKM_BUSINESS" height="36" />
          <div>
            <span className="nav-logo-name">LKM<span>_BUSINESS</span></span>
            <span className="nav-logo-slogan">Toi-même faut voir</span>
          </div>
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">Boutique</Link>
          {user ? (
            <>
              <Link to="/compte" className="nav-link">Mon compte</Link>
              {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
            </>
          ) : (
            <Link to="/connexion" className="nav-link">Connexion</Link>
          )}
        </div>

        <button className="cart-btn" onClick={handleCart}>
          🛒 <span className="cart-count">{count}</span>
        </button>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
