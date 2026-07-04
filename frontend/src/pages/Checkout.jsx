import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('orange_money');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

  const handleOrder = async () => {
    if (!user) { navigate('/account?redirect=cart'); return; }
    setLoading(true);
    try {
      const items = cart.map(c => ({
        product_id: c.item_type === 'product' ? c.product_id : null,
        plan_id: c.item_type === 'subscription' ? c.plan_id : null,
        quantity: c.qty || 1,
        unit_price: c.price,
        item_type: c.item_type,
      }));
      await api.post('/orders', { items, payment_method: payMethod, delivery_address: address });
      clearCart();
      setDone(true);
      setTimeout(() => navigate('/account'), 2500);
    } catch (err) {
      alert('Erreur lors de la commande: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="checkout-success">
      <div className="success-icon">✅</div>
      <h2>Commande confirmée !</h2>
      <p>Vos abonnements sont actifs. Redirection vers votre compte...</p>
    </div>
  );

  return (
    <div className="checkout-page">
      <h2>Finaliser la commande</h2>
      <div className="checkout-items">
        {cart.map(c => (
          <div key={c.id} className="checkout-item">
            <span>{c.ico||'📦'} {c.name} {(c.qty||1)>1?`×${c.qty}`:''}</span>
            <span>{fmt(c.price*(c.qty||1))}</span>
          </div>
        ))}
        <div className="checkout-total"><strong>Total</strong><strong>{fmt(total)}</strong></div>
      </div>
      <h3>Mode de paiement</h3>
      <div className="pay-methods">
        {[['orange_money','🟠 Orange Money'],['wave','🔵 Wave'],['stripe','💳 Carte bancaire'],['paypal','🅿️ PayPal'],['livraison','🚚 Paiement à la livraison']].map(([val,label]) => (
          <label key={val} className={`pay-method ${payMethod===val?'selected':''}`}>
            <input type="radio" value={val} checked={payMethod===val} onChange={()=>setPayMethod(val)} /> {label}
          </label>
        ))}
      </div>
      {cart.some(c=>c.item_type==='product') && (
        <div><h3>Adresse de livraison</h3><textarea className="f-input" rows={3} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Dakar, Plateau, Rue XX..."/></div>
      )}
      <button className="order-btn-big" onClick={handleOrder} disabled={loading}>
        {loading?'Traitement...':'Confirmer la commande →'}
      </button>
    </div>
  );
}
