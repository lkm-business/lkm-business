import { useState, useEffect } from 'react';
import { produitImg, youtubeEmbedUrl } from '../utils/images';
import { colorHex } from '../utils/colors';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function ProductModal({ produit, onClose, onAdd, addLabel, suffix }) {
  const [qty, setQty] = useState(1);
  const [activeIdx, setActiveIdx] = useState(0);
  const [couleur, setCouleur] = useState(null);
  useEffect(() => {
    setQty(1); setActiveIdx(0);
    setCouleur(Array.isArray(produit?.couleurs) ? produit.couleurs[0] || null : null);
  }, [produit?.id]);
  if (!produit) return null;
  const couleurs = Array.isArray(produit.couleurs) ? produit.couleurs : [];
  const enPromo = produit.prix_promo && Number(produit.prix_promo) < Number(produit.prix);

  const photos = [produit.image_principale, ...(Array.isArray(produit.images) ? produit.images : [])]
    .filter(Boolean);
  const uniquePhotos = [...new Set(photos)];
  const galleryImages = uniquePhotos.length ? uniquePhotos : [produitImg(produit)];
  const items = [
    ...galleryImages.map(src => ({ type: 'image', src })),
    ...(produit.video_url ? [{ type: 'video', src: produit.video_url }] : []),
  ];
  const active = items[activeIdx] || items[0];
  const embedUrl = active?.type === 'video' ? youtubeEmbedUrl(active.src) : null;

  return (
    <div onClick={onClose} style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20}}>
      <div onClick={e => e.stopPropagation()} style={{background: '#111', borderRadius: 16, maxWidth: 420, width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: 22, position: 'relative', border: '1px solid #262626'}}>
        <button onClick={onClose} style={{position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 28, height: 28, borderRadius: '50%', fontSize: 15, cursor: 'pointer', zIndex: 2}}>✕</button>

        <div style={{aspectRatio: '1 / 1', maxWidth: 220, margin: '0 auto 10px', borderRadius: 12, overflow: 'hidden', background: '#1a1a1a'}}>
          {active?.type === 'video' ? (
            embedUrl ? (
              <iframe src={embedUrl} title="Vidéo produit" allow="autoplay; encrypted-media" allowFullScreen style={{width: '100%', height: '100%', border: 'none'}} />
            ) : (
              <video src={active.src} controls style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            )
          ) : (
            <img
              src={active?.src || produitImg(produit)}
              alt={produit.nom}
              style={{width: '100%', height: '100%', objectFit: 'cover'}}
              onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
            />
          )}
        </div>

        {items.length > 1 && (
          <div style={{display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, justifyContent: 'center'}}>
            {items.map((it, i) => (
              <button key={i} onClick={() => setActiveIdx(i)} style={{
                flex: '0 0 auto', width: 44, height: 44, borderRadius: 8, overflow: 'hidden', position: 'relative',
                border: i === activeIdx ? '2px solid #1D9E75' : '1px solid #333', padding: 0, cursor: 'pointer', background: '#1a1a1a'
              }}>
                {it.type === 'video' ? (
                  <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16}}>▶️</div>
                ) : (
                  <img src={it.src} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={e => { e.target.style.display = 'none'; }} />
                )}
              </button>
            ))}
          </div>
        )}

        <span style={{display: 'inline-block', padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 600, background: '#E1F5EE', color: '#0F6E56', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3}}>
          {produit.categorie_nom}
        </span>

        <h3 style={{color: 'white', fontSize: 19, fontWeight: 700, marginBottom: 8}}>{produit.nom}</h3>

        <div style={{color: '#2DD4A7', fontWeight: 700, fontSize: 17, marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap'}}>
          {enPromo && <span style={{fontSize: 13, color: '#777', fontWeight: 500, textDecoration: 'line-through'}}>{fmt(produit.prix)}</span>}
          {fmt(enPromo ? produit.prix_promo : produit.prix)}{suffix && <span style={{fontSize: 12, color: '#999', fontWeight: 500}}>{suffix}</span>}
        </div>

        <p style={{color: '#ccc', fontSize: 13.5, lineHeight: 1.7, marginBottom: 20}}>
          {produit.description || "Aucune description disponible pour ce produit."}
        </p>

        {couleurs.length > 0 && (
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14}}>
            <span style={{fontSize: 13, color: '#ccc', fontWeight: 600}}>Couleur : {couleur}</span>
            <div style={{display: 'flex', gap: 6}}>
              {couleurs.map(c => (
                <button key={c} onClick={() => setCouleur(c)} title={c} style={{
                  width: 22, height: 22, borderRadius: '50%', background: colorHex(c), padding: 0, cursor: 'pointer',
                  border: couleur === c ? '2px solid #2DD4A7' : '1px solid #444',
                }} />
              ))}
            </div>
          </div>
        )}

        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14}}>
          <span style={{fontSize: 13, color: '#ccc', fontWeight: 600}}>Quantité :</span>
          <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
            width: 28, height: 28, padding: 0, background: '#1a1a1a', border: '1px solid #333', color: 'white',
            borderRadius: 6, cursor: 'pointer', fontSize: 15, fontWeight: 700
          }}>−</button>
          <span style={{fontSize: 14, fontWeight: 700, color: 'white', minWidth: 20, textAlign: 'center'}}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{
            width: 28, height: 28, padding: 0, background: '#1a1a1a', border: '1px solid #333', color: 'white',
            borderRadius: 6, cursor: 'pointer', fontSize: 15, fontWeight: 700
          }}>+</button>
        </div>

        <button onClick={() => { onAdd(qty, couleur); onClose(); }} style={{
          width: '100%', padding: 12, background: '#1D9E75', color: 'white', border: 'none',
          borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer'
        }}>
          {addLabel || '+ Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}
