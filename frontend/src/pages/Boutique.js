import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import IptvCard from '../components/IptvCard';
import ProductModal from '../components/ProductModal';
import Testimonials from '../components/Testimonials';
import HeroCarousel from '../components/HeroCarousel';
import Reveal from '../components/Reveal';
import toast from 'react-hot-toast';

const ICO = {'montres-connectees':'⌚','audio-premium':'🎧','accessoires':'📹','streaming':'🎬','iptv':'📡'};

const CAT_LABEL = {
  montres: 'Montres', audio: 'Audio', 'audio-tous': 'Audio (JBL + AirPods)', airpods: 'AirPods',
  accessoires: 'Accessoires', streaming: 'Streaming', iptv: 'IPTV',
  'iptv-premium': 'IPTV Premium', 'iptv-ultra-premium': 'IPTV Ultra Premium',
};

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
  const [detailProduit, setDetailProduit] = useState(null);
  const { ajouter } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const cat = searchParams.get('cat') || '';

  useEffect(() => {
    API.get('/produits').then(r => setProduits(r.data)).catch(() => toast.error('Erreur chargement produits'));
  }, []);

  const ajouterProduit = (p, formule=null, quantite=1) => {
    ajouter(p, formule, quantite);
    toast.success((formule ? p.nom + ' — ' + formule.duree_label : p.nom) + ' ajouté !');
  };

  const matchesCat = (p) => {
    if (!cat) return true;
    const nomLower = p.nom.toLowerCase();
    if (cat === 'airpods') return nomLower.includes('airpods');
    if (cat === 'montres') return p.categorie_slug === 'montres-connectees';
    if (cat === 'audio') return p.categorie_slug === 'audio-premium' && !nomLower.includes('airpods');
    if (cat === 'audio-tous') return p.categorie_slug === 'audio-premium';
    if (cat === 'iptv-premium' || cat === 'iptv-ultra-premium') return p.slug === cat;
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
      {/* Hero carrousel */}
      {showHome && <HeroCarousel />}

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
        <Reveal>
          <div id="produits" style={{padding: '28px 24px 6px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14}}>
              <h2 style={{fontSize: 18, fontWeight: 700, color: 'white', margin: 0}}>🔥 Nos meilleures ventes</h2>
              <div style={{display: 'flex', gap: 14}}>
                <a href="/produits" style={{fontSize: 12, color: '#2DD4A7', fontWeight: 600, textDecoration: 'none'}}>Produits physiques →</a>
                <a href="/abonnements" style={{fontSize: 12, color: '#2DD4A7', fontWeight: 600, textDecoration: 'none'}}>Abonnements & IPTV →</a>
              </div>
            </div>
            <div className="carousel-track" style={{display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 10}}>
              {bestSellers.map(p => (
                <ProductCard
                  key={p.id}
                  produit={p}
                  badge="Top ventes"
                  width={170}
                  suffix={p.categorie_slug === 'streaming' ? '/mois' : null}
                  onAdd={(qty) => p.categorie_slug === 'iptv' ? toast('Choisis une formule ci-dessous 👇') : ajouterProduit(p, null, qty)}
                  onInfo={() => setDetailProduit(p)}
                />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {!showHome && (
        <div style={{padding: '20px 24px 6px'}}>
          <div style={{marginBottom: 8, fontSize: 13, color: '#cbd5d2'}}>
            {q ? `Résultats pour « ${q} »` : `Catégorie : ${CAT_LABEL[cat] || cat}`}
            {' — '}
            <a href="/" style={{color: '#2DD4A7', fontWeight: 600, textDecoration: 'none'}}>Réinitialiser</a>
          </div>

          {filtered.length === 0 && (
            <div style={{textAlign: 'center', padding: '40px 0', color: '#cbd5d2'}}>Aucun produit ne correspond à ta recherche.</div>
          )}

          {slugs.map((slug, si) => (
            <Reveal key={slug} delay={si * 80} style={{marginBottom: 28}}>
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
                        onAdd={(qty) => ajouterProduit(p, null, qty)}
                        onInfo={() => setDetailProduit(p)}
                        addLabel={slug === 'streaming' ? "+ S'abonner" : '+ Ajouter'}
                      />
                    )
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      )}

      {showHome && <Testimonials />}

      <ProductModal
        produit={detailProduit}
        onClose={() => setDetailProduit(null)}
        suffix={detailProduit?.categorie_slug === 'streaming' ? '/mois' : null}
        addLabel={detailProduit?.categorie_slug === 'streaming' ? "+ S'abonner" : '+ Ajouter au panier'}
        onAdd={(qty) => detailProduit && ajouterProduit(detailProduit, null, qty)}
      />
    </div>
  );
}
