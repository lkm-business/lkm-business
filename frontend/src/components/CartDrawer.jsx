import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, removeFromCart, total, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();

  const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

  if (!isOpen) return null;

  return (
    <>
      <div onClick={() => setIsOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:99}} />
      <div style={{position:'fixed',right:0,top:0,height:'100%',width:'300px',background:'white',zIndex:100,display:'flex',flexDirection:'column',boxShadow:'-4px 0 20px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',borderBottom:'1px solid #e5e7eb'}}>
          <span style={{fontWeight:600,fontSize:'15px'}}>Mon panier</span>
          <button onClick={() => setIsOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
          {!cart.length ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'#9ca3af'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>🛒</div>
              Panier vide
            </div>
          ) : cart.map(c => (
            <div key={c.id} style={{display:'flex',justifyContent:'space-between',alignItems:'start',padding:'10px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:500}}>{c.ico||''} {c.name}{(c.qty||1)>1?` ×${c.qty}`:''}</div>
                <div style={{fontSize:'12px',color:'#1D9E75',fontWeight:500}}>{fmt(c.price*(c.qty||1))}</div>
              </div>
              <button onClick={() => removeFromCart(c.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:'16px'}}>✕</button>
            </div>
          ))}
        </div>
        <div style={{padding:'16px',borderTop:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontWeight:600,fontSize:'14px',marginBottom:'12px'}}>
            <span>Total</span><span>{fmt(total)}</span>
          </div>
          <button onClick={() => { setIsOpen(false); navigate('/checkout'); }} style={{width:'100%',padding:'11px',background:'#1D9E75',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
            Commander →
          </button>
          <div style={{display:'flex',gap:'4px',marginTop:'8px',flexWrap:'wrap'}}>
            {['Orange Money','Wave','Stripe','PayPal'].map(p => (
              <span key={p} style={{padding:'2px 6px',border:'1px solid #e5e7eb',borderRadius:'4px',fontSize:'10px',color:'#9ca3af'}}>{p}</span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}