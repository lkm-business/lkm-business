import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const ajouter = (produit, formule = null) => {
    const key = formule ? `${produit.id}-${formule.id}` : `${produit.id}`;
    const prixUnitaire = formule
      ? formule.prix
      : (produit.prix_promo && Number(produit.prix_promo) < Number(produit.prix) ? produit.prix_promo : produit.prix);
    setItems(prev => {
      const existant = prev.find(i => i.key === key);
      if (existant) {
        return prev.map(i => i.key === key ? { ...i, quantite: i.quantite + 1 } : i);
      }
      return [...prev, {
        key,
        produit_id: produit.id,
        formule_iptv_id: formule ? formule.id : null,
        nom: formule ? `${produit.nom} — ${formule.duree_label}` : produit.nom,
        prix: prixUnitaire,
        quantite: 1,
        type: produit.type,
        days: formule ? formule.duree_jours : null,
      }];
    });
  };

  const retirer = (key) => setItems(prev => prev.filter(i => i.key !== key));

  const modifierQte = (key, quantite) => {
    if (quantite < 1) { retirer(key); return; }
    setItems(prev => prev.map(i => i.key === key ? { ...i, quantite } : i));
  };

  const vider = () => setItems([]);

  const total = items.reduce((s, i) => s + i.prix * i.quantite, 0);
  const nbArticles = items.reduce((s, i) => s + i.quantite, 0);

  return (
    <CartContext.Provider value={{ items, ajouter, retirer, modifierQte, vider, total, nbArticles, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
