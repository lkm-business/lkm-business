import { produitImg } from '../utils/images';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function ProductCard({ produit, badge, suffix, onAdd, onInfo, addLabel, width }) {
  return (
    <div className="product-card" style={{
      width: width || 165, flexShrink: 0, background: '#111', borderRadius: 14,
      boxShadow: '0 4px 14px rgba(0,0,0,0.5)', border: '1px solid #262626', padding: 12, position: 'relative'
    }}>
      {badge && (
        <span style={{
          position: 'absolute', top: 8, left: 8, background: '#1D9E75', color: 'white',
          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20, zIndex: 1
        }}>{badge}</span>
      )}
      {onInfo && (
        <button onClick={onInfo} title="Voir les détails" style={{
          position: 'absolute', top: 8, right: 8, zIndex: 1, width: 24, height: 24, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>i</button>
      )}
      <div style={{aspectRatio: '1 / 1', background: '#1a1a1a', borderRadius: 10, overflow: 'hidden', marginBottom: 10}}>
        <img
          src={produitImg(produit)}
          alt={produit.nom}
          className="product-img"
          style={{width: '100%', height: '100%', objectFit: 'cover'}}
          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
        />
      </div>
      <span style={{
        display: 'inline-block', padding: '2px 7px', borderRadius: 5, fontSize: 9, fontWeight: 600,
        background: '#E1F5EE', color: '#0F6E56', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3
      }}>{produit.categorie_nom}</span>
      <div style={{fontSize: 13, fontWeight: 600, marginBottom: 4, minHeight: 32, color: 'white'}}>{produit.nom}</div>
      <div style={{fontSize: 14, fontWeight: 700, color: '#2DD4A7', marginBottom: 8}}>
        {fmt(produit.prix)}{suffix && <span style={{fontSize: 10, color: '#999', fontWeight: 500}}>{suffix}</span>}
      </div>
      <button onClick={onAdd} style={{
        width: '100%', padding: 8, background: '#1D9E75', color: 'white', border: 'none',
        borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
      }}>
        {addLabel || '+ Ajouter'}
      </button>
    </div>
  );
}
