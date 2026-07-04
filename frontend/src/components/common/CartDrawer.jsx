import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const fmt = (n) => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function CartDrawer({ open, onClose }) {
  const { cart, removeItem, updateQty, total, count } = useCart();
  const navigate = useNavigate();

  const goCheckout = () => {
    onClose();
    navigate('/commander');
  };

  if (!open) return null;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-header">
          <span>Panier ({count})</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="cart-body">
          {!cart.length && <p className="cart-empty">Panier vide</p>}
          {cart.map(c => (
            <div key={c._key} className="cart-item">
              <div className="cart-item-info">
                <div className="cart-item-name">{c.name}</div>
                <div className="cart-item-price">{fmt(c.price * c.qty)}</div>
              </div>
              <div className="cart-item-actions">
                <button onClick={() => updateQty(c._key, c.qty - 1)}>−</button>
                <span>{c.qty}</span>
                <button onClick={() => updateQty(c._key, c.qty + 1)}>+</button>
                <button className="remove-btn" onClick={() => removeItem(c._key)}>🗑</button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total"><span>Total</span><span>{fmt(total)}</span></div>
            <button className="checkout-btn" onClick={goCheckout}>Commander →</button>
            <div className="payment-methods">
              <span>Orange Money</span><span>Wave</span><span>Stripe</span><span>PayPal</span><span>Livraison</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
