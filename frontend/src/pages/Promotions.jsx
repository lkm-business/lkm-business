import { useState, useEffect } from 'react';
import API from '../utils/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function Promotions() {
  const [produits, setProduits] = useState([]);
  const { ajouter } = useCart();

  useEffect(() => {
    API.get('/produits').then(r => setProduits(r.data)).catch(() => toast.error('Erreur chargement produits'));
  }, []);

  const promos = produits.filter(p => p.prix_promo && Number(p.prix_promo) < Number(p.prix));

  const ajouterProduit = (p) => {
    ajouter(p);
    toast.success(p.nom + ' ajouté !');
  };

  return (
    <div style={{padding: '32px 24px', minHeight: '50vh'}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6}}>🔥 Promotions en cours</h1>
      <p style={{fontSize: 13, color: '#cbd5d2', marginBottom: 24}}>Profite de nos meilleures offres du moment.</p>

      {promos.length === 0 ? (
        <p style={{color: '#cbd5d2'}}>Aucune promotion active pour le moment — reviens bientôt !</p>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 14}}>
          {promos.map(p => (
            <ProductCard key={p.id} produit={p} onAdd={() => ajouterProduit(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
