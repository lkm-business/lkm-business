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
      <div onClick={() => setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:99}} />
      <div style={{position:'fixed',right:0,top:0,height:'100%',width:'300px',background:'#111',zIndex:100,display:'flex',flexDirection:'column',boxShadow:'-4px 0 20px rgba(0,0,0,0.5)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px',borderBottom:'1px solid #262626'}}>
          <span style={{fontWeight:600,fontSize:'15px',color:'white'}}>Mon panier</span>
          <button onClick={() => setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'white'}}>✕</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
          {!items.length ? (
            <div style={{textAlign:'center',padding:'40px 0',color:'#888'}}>
              <div style={{fontSize:'32px',marginBottom:'8px'}}>🛒</div>
              Panier vide
            </div>
          ) : items.map(i => (
            <div key={i.key} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid #262626',gap:8}}>
              <div>
                <div style={{fontSize:'13px',fontWeight:500,color:'white'}}>{i.nom}</div>
                <div style={{fontSize:'12px',color:'#2DD4A7',fontWeight:500}}>{fmt(i.prix * i.quantite)}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                <button onClick={() => modifierQte(i.key, i.quantite - 1)} style={{width:20,height:20,border:'1px solid #333',borderRadius:4,background:'#1a1a1a',color:'white',cursor:'pointer',fontSize:12}}>−</button>
                <span style={{fontSize:12,color:'white'}}>{i.quantite}</span>
                <button onClick={() => modifierQte(i.key, i.quantite + 1)} style={{width:20,height:20,border:'1px solid #333',borderRadius:4,background:'#1a1a1a',color:'white',cursor:'pointer',fontSize:12}}>+</button>
                <button onClick={() => retirer(i.key)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:14,marginLeft:2}}>🗑</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{padding:'16px',borderTop:'1px solid #262626'}}>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:600,fontSize:'14px',marginBottom:'12px',color:'white'}}>
              <span>Total</span><span>{fmt(total)}</span>
            </div>
            <button onClick={goCheckout} style={{width:'100%',padding:'11px',background:'#1D9E75',color:'white',border:'none',borderRadius:'8px',fontSize:'14px',fontWeight:600,cursor:'pointer'}}>
              Commander →
            </button>
            <div style={{display:'flex',gap:'4px',marginTop:'8px',flexWrap:'wrap'}}>
              {['Wave','Orange Money','Carte bancaire'].map(p => (
                <span key={p} style={{padding:'2px 6px',border:'1px solid #333',borderRadius:'4px',fontSize:'10px',color:'#888'}}>{p}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
