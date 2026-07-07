import { produitImg } from '../utils/images';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function ProductModal({ produit, onClose, onAdd, addLabel, suffix }) {
  if (!produit) return null;
  return (
    <div onClick={onClose} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{background: '#111', borderRadius: 16, maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 22, position: 'relative', border: '1px solid #262626'}}>
        <button onClick={onClose} style={{position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', fontSize: 15, cursor: 'pointer'}}>✕</button>

        <div style={{aspectRatio: '1 / 1', maxWidth: 220, margin: '0 auto 18px', borderRadius: 12, overflow: 'hidden', background: '#1a1a1a'}}>
          <img
            src={produitImg(produit)}
            alt={produit.nom}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        </div>

        <span style={{display: 'inline-block', padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: '#E1F5EE', color: '#0F6E56', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3}}>
          {produit.categorie_nom}
        </span>

        <h3 style={{color: 'white', fontSize: 19, fontWeight: 700, marginBottom: 8}}>{produit.nom}</h3>

        <div style={{color: '#2DD4A7', fontWeight: 700, fontSize: 17, marginBottom: 14}}>
          {fmt(produit.prix)}{suffix && <span style={{fontSize: 12, color: '#999', fontWeight: 500}}>{suffix}</span>}
        </div>

        <p style={{color: '#ccc', fontSize: 13.5, lineHeight: 1.7, marginBottom: 20}}>
          {produit.description || "Aucune description disponible pour ce produit."}
        </p>

        <button onClick={() => { onAdd(); onClose(); }} style={{
          width: '100%', padding: 12, background: '#1D9E75', color: 'white', border: 'none',
          borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
        }}>
          {addLabel || '+ Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}
