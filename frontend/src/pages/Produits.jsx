import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../utils/api';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import Reveal from '../components/Reveal';
import toast from 'react-hot-toast';

function Section({ id, ico, titre, items, onAdd, onInfo }) {
  if (!items.length) return null;
  return (
    <Reveal style={{marginBottom: 32}}>
      <div id={id}>
        <h2 style={{fontSize: 16, fontWeight: 700, marginBottom: 14, color: 'white'}}>{ico} {titre}</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 14}}>
          {items.map(p => <ProductCard key={p.id} produit={p} onAdd={(qty, couleur) => onAdd(p, qty, couleur)} onInfo={() => onInfo(p)} />)}
        </div>
      </div>
    </Reveal>
  );
}

export default function Produits() {
  const [produits, setProduits] = useState([]);
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

  const ajouterProduit = (p, quantite=1, couleur=null) => {
    ajouter(p, null, quantite, couleur);
    toast.success(p.nom + ' ajouté !');
  };

  const montres = produits.filter(p => p.categorie_slug === 'montres-connectees');
  const audio = produits.filter(p => p.categorie_slug === 'audio-premium');
  const accessoires = produits.filter(p => p.categorie_slug === 'accessoires');

  return (
    <div style={{padding: '32px 24px', minHeight: '60vh'}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 24}}>📦 Nos produits</h1>
      <Section id="montres" ico="⌚" titre="Montres connectées" items={montres} onAdd={ajouterProduit} onInfo={setDetailProduit} />
      <Section id="audio" ico="🎧" titre="Audio" items={audio} onAdd={ajouterProduit} onInfo={setDetailProduit} />
      <Section id="accessoires" ico="📹" titre="Accessoires" items={accessoires} onAdd={ajouterProduit} onInfo={setDetailProduit} />

      <ProductModal
        produit={detailProduit}
        onClose={() => setDetailProduit(null)}
        onAdd={(qty, couleur) => detailProduit && ajouterProduit(detailProduit, qty, couleur)}
      />
    </div>
  );
}
