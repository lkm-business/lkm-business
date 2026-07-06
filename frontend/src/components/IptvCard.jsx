import { produitImg } from '../utils/images';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function IptvCard({ produit, selected, onSelectFormule, onAdd }) {
  return (
    <div className="product-card" style={{background: '#111', border: produit.slug === 'iptv-ultra-premium' ? '2px solid #1D9E75' : '1px solid #262626', borderRadius: 14, padding: 14, boxShadow: '0 4px 14px rgba(0,0,0,0.5)'}}>
      {produit.slug === 'iptv-ultra-premium' && (
        <div style={{display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: 10, background: '#E1F5EE', color: '#0F6E56', marginBottom: 8, fontWeight: 600}}>⭐ Ultra Premium</div>
      )}
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10}}>
        <div style={{width: 56, height: 56, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#1a1a1a'}}>
          <img
            src={produitImg(produit)}
            alt={produit.nom}
            className="product-img"
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        </div>
        <div>
          <div style={{fontSize: 14, fontWeight: 600, color: 'white'}}>{produit.nom}</div>
          <div style={{fontSize: 11, color: '#999'}}>{produit.slug === 'iptv-premium' ? '18 000 chaînes • 80 000 films' : '23 000 chaînes 4K • 128 000 films'}</div>
        </div>
      </div>
      <div style={{fontSize: 11, color: '#ccc', fontWeight: 500, marginBottom: 8}}>Choisir une formule :</div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10}}>
        {(produit.formules || []).map(f => (
          <button key={f.id} onClick={() => onSelectFormule(f)} style={{
            padding: '7px 8px', border: selected?.id === f.id ? '2px solid #1D9E75' : '1px solid #333',
            borderRadius: 8, cursor: 'pointer', background: selected?.id === f.id ? 'rgba(29,158,117,0.15)' : '#1a1a1a',
            textAlign: 'left', transition: 'all 0.1s'
          }}>
            <span style={{display: 'block', fontSize: 11, fontWeight: 500, color: selected?.id === f.id ? '#2DD4A7' : '#ddd'}}>{f.duree_label}</span>
            <span style={{fontSize: 11, color: '#2DD4A7', fontWeight: 600}}>{fmt(f.prix)}</span>
          </button>
        ))}
      </div>
      <button
        disabled={!selected}
        onClick={onAdd}
        style={{
          width: '100%', padding: 8, background: selected ? '#1D9E75' : '#262626',
          color: selected ? 'white' : '#777', border: 'none', borderRadius: 8,
          cursor: selected ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 600
        }}>
        + Ajouter au panier
      </button>
    </div>
  );
}
