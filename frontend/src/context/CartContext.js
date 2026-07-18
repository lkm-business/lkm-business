import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const ajouter = (produit, formule = null, quantite = 1, couleur = null) => {
    const key = `${produit.id}${formule ? '-' + formule.id : ''}${couleur ? '-' + couleur : ''}`;
    const enPromo = !formule && produit.prix_promo && Number(produit.prix_promo) < Number(produit.prix);
    const prixUnitaire = formule ? formule.prix : (enPromo ? Number(produit.prix_promo) : produit.prix);
    const nomBase = formule ? `${produit.nom} — ${formule.duree_label}` : produit.nom;
    setItems(prev => {
      const existant = prev.find(i => i.key === key);
      if (existant) {
        return prev.map(i => i.key === key ? { ...i, quantite: i.quantite + quantite } : i);
      }
      return [...prev, {
        key,
        produit_id: produit.id,
        formule_iptv_id: formule ? formule.id : null,
        nom: couleur ? `${nomBase} (${couleur})` : nomBase,
        couleur,
        prix: prixUnitaire,
        quantite,
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
