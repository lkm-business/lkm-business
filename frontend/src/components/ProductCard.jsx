import { useState } from 'react';
import { produitImg } from '../utils/images';
import { colorHex } from '../utils/colors';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function ProductCard({ produit, badge, suffix, onAdd, onInfo, addLabel, width }) {
  const [qty, setQty] = useState(1);
  const couleurs = Array.isArray(produit.couleurs) ? produit.couleurs : [];
  const [couleur, setCouleur] = useState(couleurs[0] || null);
  const enPromo = produit.prix_promo && Number(produit.prix_promo) < Number(produit.prix);
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
      {enPromo && (
        <span style={{
          position: 'absolute', top: 8, right: 8, background: '#E63946', color: 'white',
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, zIndex: 1
        }}>PROMO</span>
      )}
      <div
        onClick={onInfo}
        style={{aspectRatio: '1 / 1', background: '#1a1a1a', borderRadius: 10, overflow: 'hidden', marginBottom: 10, cursor: onInfo ? 'pointer' : 'default'}}
      >
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
      <div style={{fontSize: 14, fontWeight: 700, color: '#2DD4A7', marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap'}}>
        {enPromo && <span style={{fontSize: 11, color: '#777', fontWeight: 500, textDecoration: 'line-through'}}>{fmt(produit.prix)}</span>}
        {fmt(enPromo ? produit.prix_promo : produit.prix)}{suffix && <span style={{fontSize: 10, color: '#999', fontWeight: 500}}>{suffix}</span>}
      </div>
      {couleurs.length > 0 && (
        <div style={{display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8}}>
          {couleurs.map(c => (
            <button key={c} onClick={() => setCouleur(c)} title={c} style={{
              width: 18, height: 18, borderRadius: '50%', background: colorHex(c), padding: 0, cursor: 'pointer',
              border: couleur === c ? '2px solid #2DD4A7' : '1px solid #444',
            }} />
          ))}
        </div>
      )}
      <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8}}>
        <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
          width: 22, height: 22, padding: 0, background: '#1a1a1a', border: '1px solid #333', color: 'white',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700
        }}>−</button>
        <span style={{fontSize: 12, fontWeight: 600, color: 'white', minWidth: 16, textAlign: 'center'}}>{qty}</span>
        <button onClick={() => setQty(q => q + 1)} style={{
          width: 22, height: 22, padding: 0, background: '#1a1a1a', border: '1px solid #333', color: 'white',
          borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 700
        }}>+</button>
      </div>
      <div style={{display: 'flex', gap: 6}}>
        {onInfo && (
          <button onClick={onInfo} title="Voir les détails" style={{
            flex: '0 0 auto', padding: '0 10px', background: '#1a1a1a', border: '1px solid #333', color: 'white',
            borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700
          }}>
            ℹ️
          </button>
        )}
        <button onClick={() => onAdd(qty, couleur)} style={{
          flex: 1, padding: 8, background: '#1D9E75', color: 'white', border: 'none',
          borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}>
          {addLabel || '+ Ajouter'}
        </button>
      </div>
    </div>
  );
}
