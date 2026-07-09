import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import IptvCard from '../components/IptvCard';
import ProductModal from '../components/ProductModal';
import Reveal from '../components/Reveal';
import toast from 'react-hot-toast';

export default function Abonnements() {
  const [produits, setProduits] = useState([]);
  const [iptvSel, setIptvSel] = useState({});
  const [detailProduit, setDetailProduit] = useState(null);
  const { ajouter } = useCart();
  const location = useLocation();

  useEffect(() => {
    API.get('/produits').then(r => setProduits(r.data)).catch(() => toast.error('Erreur chargement produits'));
  }, []);

  useEffect(() => {
    if (!location.hash || produits.length === 0) return;
    const el = document.querySelector(location.hash);
    if (el) setTimeout(() => el.scrollIntoView({behavior: 'smooth'}), 100);
  }, [location.hash, produits]);

  const ajouterProduit = (p, formule = null, quantite = 1) => {
    ajouter(p, formule, quantite);
    toast.success((formule ? p.nom + ' — ' + formule.duree_label : p.nom) + ' ajouté !');
  };

  const streaming = produits.filter(p => p.categorie_slug === 'streaming');
  const iptvPremium = produits.find(p => p.slug === 'iptv-premium');
  const iptvUltra = produits.find(p => p.slug === 'iptv-ultra-premium');

  return (
    <div style={{padding: '32px 24px', minHeight: '60vh'}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 24}}>📺 Abonnements & IPTV</h1>

      {streaming.length > 0 && (
        <Reveal style={{marginBottom: 32}}>
          <div id="streaming">
            <h2 style={{fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'white'}}>🎬 Streaming</h2>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 14}}>
              {streaming.map(p => (
                <ProductCard key={p.id} produit={p} suffix="/mois" addLabel="+ S'abonner" onAdd={(qty) => ajouterProduit(p, null, qty)} onInfo={() => setDetailProduit(p)} />
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {iptvPremium && (
        <Reveal delay={80} style={{marginBottom: 32}}>
          <div id="iptv-premium">
            <h2 style={{fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'white'}}>📡 IPTV Premium</h2>
            <div style={{maxWidth: 320}}>
              <IptvCard
                produit={iptvPremium}
                selected={iptvSel[iptvPremium.id]}
                onSelectFormule={f => setIptvSel(s => ({...s, [iptvPremium.id]: f}))}
                onAdd={() => { if (iptvSel[iptvPremium.id]) ajouterProduit(iptvPremium, iptvSel[iptvPremium.id]); }}
              />
            </div>
          </div>
        </Reveal>
      )}

      {iptvUltra && (
        <Reveal delay={160} style={{marginBottom: 32}}>
          <div id="iptv-ultra-premium">
            <h2 style={{fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'white'}}>🛰️ IPTV Ultra Premium</h2>
            <div style={{maxWidth: 320}}>
              <IptvCard
                produit={iptvUltra}
                selected={iptvSel[iptvUltra.id]}
                onSelectFormule={f => setIptvSel(s => ({...s, [iptvUltra.id]: f}))}
                onAdd={() => { if (iptvSel[iptvUltra.id]) ajouterProduit(iptvUltra, iptvSel[iptvUltra.id]); }}
              />
            </div>
          </div>
        </Reveal>
      )}

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
