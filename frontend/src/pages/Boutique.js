import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import { flickrImg } from '../utils/images';
import ProductCard from '../components/ProductCard';
import IptvCard from '../components/IptvCard';
import Testimonials from '../components/Testimonials';
import toast from 'react-hot-toast';

const ICO = {'montres-connectees':'⌚','audio-premium':'🎧','accessoires':'📹','streaming':'🎬','iptv':'📡'};

const CAT_LABEL = { montres: 'Montres', audio: 'Audio', airpods: 'AirPods', accessoires: 'Accessoires', streaming: 'Streaming', iptv: 'IPTV' };

const CATEGORIES = [
  { key: 'montres', label: 'Montres', ico: '⌚' },
  { key: 'audio', label: 'Audio', ico: '🎧' },
  { key: 'airpods', label: 'AirPods', ico: '🎧' },
  { key: 'accessoires', label: 'Accessoires', ico: '📹' },
  { key: 'streaming', label: 'Streaming', ico: '🎬' },
  { key: 'iptv', label: 'IPTV', ico: '📡' },
];

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

export default function Boutique() {
  const [produits, setProduits] = useState([]);
  const [iptvSel, setIptvSel] = useState({});
  const { ajouter } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';

  useEffect(() => {
    API.get('/produits').then(r => setProduits(r.data)).catch(() => toast.error('Erreur chargement produits'));
  }, []);

  const ajouterProduit = (p, formule=null) => {
    ajouter(p, formule);
    toast.success((formule ? p.nom + ' — ' + formule.duree_label : p.nom) + ' ajouté !');
  };

  const matchesCat = (p) => {
    if (!cat) return true;
    const nomLower = p.nom.toLowerCase();
    if (cat === 'airpods') return nomLower.includes('airpods');
    if (cat === 'montres') return p.categorie_slug === 'montres-connectees';
    if (cat === 'audio') return p.categorie_slug === 'audio-premium' && !nomLower.includes('airpods');
    return p.categorie_slug === cat;
  };
  const matchesQuery = (p) => !q || p.nom.toLowerCase().includes(q.toLowerCase());

  const filtered = produits.filter(p => matchesCat(p) && matchesQuery(p));
  const slugs = [...new Set(filtered.map(p => p.categorie_slug))];

  const bestSellers = produits.slice(0, 8);
  const bestSellerSlugs = new Set(bestSellers.map(p => p.slug));

  const showHome = !q && !cat;

  return (
    <div>
      {/* Hero */}
      {showHome && (
        <div style={{position: 'relative', height: 420, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'white'}}>
          <img src={flickrImg('headphones,speaker', 99, 1600, 800)} alt="" style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)'}} />
          <div style={{position: 'relative', zIndex: 2, maxWidth: 640, padding: '0 24px'}}>
            <div style={{fontSize: 12, fontWeight: 600, letterSpacing: 1, opacity: 0.85, marginBottom: 10, textTransform: 'uppercase'}}>" Toi-même faut voir "</div>
            <h1 style={{fontSize: 34, fontWeight: 700, marginBottom: 14, lineHeight: 1.2}}>Découvrez la meilleure qualité sonore</h1>
            <p style={{fontSize: 14, opacity: 0.9, marginBottom: 22}}>Montres connectées, audio premium, streaming et IPTV — livrés rapidement, payés en toute sécurité.</p>
            <button onClick={() => document.getElementById('produits')?.scrollIntoView({behavior: 'smooth'})} style={{
              background: 'white', color: '#0F6E56', border: 'none', padding: '12px 26px', borderRadius: 30,
              fontSize: 14, fontWeight: 700, cursor: 'pointer'
            }}>
              Découvrir la boutique
            </button>
          </div>
        </div>
      )}

      {/* Catégories rapides */}
      {showHome && (
        <div style={{display: 'flex', gap: 8, padding: '18px 24px 0', overflowX: 'auto'}}>
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => navigate(`/?cat=${c.key}`)} style={{
              padding: '7px 14px', fontSize: 12, fontWeight: 600, borderRadius: 20, whiteSpace: 'nowrap',
              border: '1px solid #333', background: '#111', color: 'white', cursor: 'pointer'
            }}>
              {c.ico} {c.label}
            </button>
          ))}
        </div>
      )}

      {/* Meilleures ventes */}
      {showHome && bestSellers.length > 0 && (
        <div style={{padding: '28px 24px 6px'}}>
          <h2 style={{fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'white'}}>🔥 Nos meilleures ventes</h2>
          <div className="carousel-track" style={{display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 10}}>
            {bestSellers.map(p => (
              <ProductCard
                key={p.id}
                produit={p}
                badge="Top ventes"
                width={170}
                suffix={p.categorie_slug === 'streaming' ? '/mois' : null}
                onAdd={() => p.categorie_slug === 'iptv' ? toast('Choisis une formule ci-dessous 👇') : ajouterProduit(p)}
              />
            ))}
          </div>
        </div>
      )}

      <div id="produits" style={{padding: '20px 24px 6px'}}>
        {!showHome && (
          <div style={{marginBottom: 8, fontSize: 13, color: '#cbd5d2'}}>
            {q ? `Résultats pour « ${q} »` : `Catégorie : ${CAT_LABEL[cat] || cat}`}
            {' — '}
            <a href="/" style={{color: '#2DD4A7', fontWeight: 600, textDecoration: 'none'}}>Réinitialiser</a>
          </div>
        )}

        {filtered.length === 0 && !showHome && (
          <div style={{textAlign: 'center', padding: '40px 0', color: '#cbd5d2'}}>Aucun produit ne correspond à ta recherche.</div>
        )}

        {slugs.map(slug => (
          <div key={slug} style={{marginBottom: 28}}>
            <div style={{fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'white'}}>
              {ICO[slug] || '📦'} {filtered.find(p => p.categorie_slug === slug)?.categorie_nom}
            </div>
            <div style={{display: 'grid', gridTemplateColumns: slug === 'iptv' ? 'repeat(auto-fill,minmax(260px,1fr))' : 'repeat(auto-fill,minmax(165px,1fr))', gap: 14}}>
              {filtered.filter(p => p.categorie_slug === slug).map(p => (
                slug === 'iptv'
                  ? (
                    <IptvCard
                      key={p.id}
                      produit={p}
                      selected={iptvSel[p.id]}
                      onSelectFormule={f => setIptvSel(s => ({...s, [p.id]: f}))}
                      onAdd={() => { if (iptvSel[p.id]) ajouterProduit(p, iptvSel[p.id]); }}
                    />
                  )
                  : (
                    <ProductCard
                      key={p.id}
                      produit={p}
                      badge={bestSellerSlugs.has(p.slug) ? 'Top ventes' : null}
                      suffix={slug === 'streaming' ? '/mois' : null}
                      onAdd={() => ajouterProduit(p)}
                      addLabel={slug === 'streaming' ? "+ S'abonner" : '+ Ajouter'}
                    />
                  )
              ))}
            </div>
          </div>
        ))}
      </div>

      {showHome && <Testimonials />}
    </div>
  );
}
