import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function CartDrawer() {
  const { items, retirer, modifierQte, total, open, setOpen } = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const goCheckout = () => {
    setOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div onClick={() => setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.3)',zIndex:99}} />
      <div style={{position:'fixed',right:0,top:0,height:'100%',width:'300px',background:'white',zIndex:100,display:'flex',flexDirection:'column',boxShadow:'-4px 0 20px rgba(0,0,0,0.15)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',borderBottom:'1px solid #e5e7eb'}}>
          <span style={{fontWeight:600,fontSize:'15px'}}>Mon panier</span>
          <button onClick={() => setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px'}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
          {!items.length ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'#9ca3af'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>🛒</div>
              Panier vide
            </div>
          ) : items.map(i => (
            <div key={i.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #f3f4f6',gap:8}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:500}}>{i.nom}</div>
                <div style={{fontSize:'12px',color:'#1D9E75',fontWeight:500}}>{fmt(i.prix * i.quantite)}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                <button onClick={() => modifierQte(i.key, i.quantite - 1)} style={{width:20,height:20,border:'0.5px solid #ddd',borderRadius:4,background:'none',cursor:'pointer',fontSize:12}}>−</button>
                <span style={{fontSize:12}}>{i.quantite}</span>
                <button onClick={() => modifierQte(i.key, i.quantite + 1)} style={{width:20,height:20,border:'0.5px solid #ddd',borderRadius:4,background:'none',cursor:'pointer',fontSize:12}}>+</button>
                <button onClick={() => retirer(i.key)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:14,marginLeft:2}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{padding:'16px',borderTop:'1px solid #e5e7eb'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:600,fontSize:'14px',marginBottom:'12px'}}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <button onClick={goCheckout} style={{width:'100%',padding:'11px',background:'#1D9E75',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
              Commander →
            </button>
            <div style={{display:'flex',gap:'4px',marginTop:'8px',flexWrap:'wrap'}}>
              {['Orange Money','Wave','Stripe','PayPal'].map(p => (
                <span key={p} style={{padding:'2px 6px',border:'1px solid #e5e7eb',borderRadius:'4px',fontSize:'10px',color:'#9ca3af'}}>{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
