import { useState, useEffect } from 'react';
import API from '../utils/api';
import { colorHex } from '../utils/colors';
import toast from 'react-hot-toast';

const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

const inputStyle = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid #333',
  background: '#1a1a1a', color: 'white', fontSize: 12, boxSizing: 'border-box'
};

export default function Admin() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState({});
  const [nouveau, setNouveau] = useState({ nom: '', description: '', prix: '', type: 'physique', categorie_id: '', image_principale: '', stock: 0, images: '', video_url: '', couleurs: '' });
  const [creation, setCreation] = useState(false);

  const charger = async () => {
    try {
      const [pRes, cRes] = await Promise.all([API.get('/produits/admin/tous'), API.get('/categories')]);
      setProduits(pRes.data);
      setCategories(cRes.data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const majEdit = (id, champ, valeur) => setEdits(e => ({ ...e, [id]: { ...e[id], [champ]: valeur } }));

  const valeur = (p, champ) => edits[p.id]?.[champ] !== undefined ? edits[p.id][champ] : (p[champ] ?? '');
  const valeurImages = (p) => edits[p.id]?.images !== undefined ? edits[p.id].images : (Array.isArray(p.images) ? p.images.join('\n') : '');
  const valeurCouleurs = (p) => edits[p.id]?.couleurs !== undefined ? edits[p.id].couleurs : (Array.isArray(p.couleurs) ? p.couleurs.join(', ') : '');

  const enregistrerLigne = async (p) => {
    const e = edits[p.id] || {};
    try {
      await API.put(`/produits/${p.id}`, {
        prix: e.prix !== undefined ? Number(e.prix) : undefined,
        prix_promo: e.prix_promo !== undefined ? (e.prix_promo === '' ? null : Number(e.prix_promo)) : (p.prix_promo ?? null),
        stock: e.stock !== undefined ? Number(e.stock) : undefined,
        image_principale: e.image_principale !== undefined ? e.image_principale : undefined,
        images: e.images !== undefined ? e.images.split('\n').map(s => s.trim()).filter(Boolean) : undefined,
        video_url: e.video_url !== undefined ? (e.video_url.trim() || null) : (p.video_url ?? null),
        couleurs: e.couleurs !== undefined ? e.couleurs.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      });
      toast.success(p.nom + ' mis à jour');
      setEdits(prev => { const cp = { ...prev }; delete cp[p.id]; return cp; });
      charger();
    } catch { toast.error('Erreur mise à jour'); }
  };

  const toggleActif = async (p) => {
    try {
      await API.put(`/produits/${p.id}`, { est_actif: !p.est_actif });
      toast.success(p.est_actif ? 'Produit désactivé' : 'Produit réactivé');
      charger();
    } catch { toast.error('Erreur'); }
  };

  const supprimer = async (p) => {
    if (!window.confirm(`Désactiver "${p.nom}" ? Il ne sera plus visible dans la boutique.`)) return;
    try {
      await API.delete(`/produits/${p.id}`);
      toast.success('Produit désactivé');
      charger();
    } catch { toast.error('Erreur suppression'); }
  };

  const creerProduit = async (e) => {
    e.preventDefault();
    if (!nouveau.nom || !nouveau.prix) { toast.error('Nom et prix requis'); return; }
    setCreation(true);
    try {
      await API.post('/produits', {
        ...nouveau,
        prix: Number(nouveau.prix),
        categorie_id: nouveau.categorie_id || null,
        stock: Number(nouveau.stock) || 0,
        images: nouveau.images.split('\n').map(s => s.trim()).filter(Boolean),
        video_url: nouveau.video_url.trim() || null,
        couleurs: nouveau.couleurs.split(',').map(s => s.trim()).filter(Boolean),
      });
      toast.success('Produit créé !');
      setNouveau({ nom: '', description: '', prix: '', type: 'physique', categorie_id: '', image_principale: '', stock: 0, images: '', video_url: '', couleurs: '' });
      charger();
    } catch { toast.error('Erreur création'); }
    finally { setCreation(false); }
  };

  if (loading) return <div style={{maxWidth: 1000, margin: '32px auto', padding: '0 20px', color: '#cbd5d2'}}>Chargement...</div>;

  return (
    <div style={{maxWidth: 1000, margin: '32px auto', padding: '0 20px 60px'}}>
      <h1 style={{fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6}}>🛠️ Administration</h1>
      <p style={{fontSize: 13, color: '#999', marginBottom: 28}}>Gère les produits, les stocks et les promotions.</p>

      <h3 style={{fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'white'}}>➕ Ajouter un produit</h3>
      <form onSubmit={creerProduit} style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10,
        background: '#111', border: '1px solid #262626', borderRadius: 12, padding: 16, marginBottom: 32
      }}>
        <input placeholder="Nom du produit" style={inputStyle} value={nouveau.nom} onChange={e => setNouveau(n => ({...n, nom: e.target.value}))} />
        <input placeholder="Prix (FCFA)" type="number" style={inputStyle} value={nouveau.prix} onChange={e => setNouveau(n => ({...n, prix: e.target.value}))} />
        <select style={inputStyle} value={nouveau.type} onChange={e => setNouveau(n => ({...n, type: e.target.value}))}>
          <option value="physique">Physique</option>
          <option value="numerique">Numérique</option>
        </select>
        <select style={inputStyle} value={nouveau.categorie_id} onChange={e => setNouveau(n => ({...n, categorie_id: e.target.value}))}>
          <option value="">Catégorie...</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <input placeholder="Stock" type="number" style={inputStyle} value={nouveau.stock} onChange={e => setNouveau(n => ({...n, stock: e.target.value}))} />
        <input placeholder="Photo principale (URL)" style={inputStyle} value={nouveau.image_principale} onChange={e => setNouveau(n => ({...n, image_principale: e.target.value}))} />
        <input placeholder="Vidéo (YouTube ou lien Cloudinary)" style={inputStyle} value={nouveau.video_url} onChange={e => setNouveau(n => ({...n, video_url: e.target.value}))} />
        <textarea placeholder={"Photos supplémentaires — une URL par ligne"} style={{...inputStyle, gridColumn: '1 / -1', minHeight: 60, resize: 'vertical', fontFamily: 'inherit'}} value={nouveau.images} onChange={e => setNouveau(n => ({...n, images: e.target.value}))} />
        {nouveau.type === 'physique' && (
          <div style={{gridColumn: '1 / -1'}}>
            <input placeholder="Couleurs disponibles — séparées par des virgules (ex: Noir, Rose, Gris)" style={{...inputStyle, width: '100%'}} value={nouveau.couleurs} onChange={e => setNouveau(n => ({...n, couleurs: e.target.value}))} />
            {nouveau.couleurs.trim() && (
              <div style={{display: 'flex', gap: 6, marginTop: 6}}>
                {nouveau.couleurs.split(',').map(s => s.trim()).filter(Boolean).map((c, i) => (
                  <span key={i} title={c} style={{width: 18, height: 18, borderRadius: '50%', background: colorHex(c), border: '1px solid #444'}} />
                ))}
              </div>
            )}
          </div>
        )}
        <input placeholder="Description" style={{...inputStyle, gridColumn: '1 / -1'}} value={nouveau.description} onChange={e => setNouveau(n => ({...n, description: e.target.value}))} />
        <button type="submit" disabled={creation} style={{
          gridColumn: '1 / -1', padding: 10, background: '#1D9E75', color: 'white', border: 'none',
          borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: creation ? 'default' : 'pointer', opacity: creation ? 0.7 : 1
        }}>
          {creation ? 'Création...' : 'Créer le produit'}
        </button>
      </form>

      <h3 style={{fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'white'}}>📦 Produits ({produits.length})</h3>
      <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
        {produits.map(p => (
          <div key={p.id} style={{
            background: '#111', border: '1px solid #262626', borderRadius: 12, padding: 14,
            opacity: p.est_actif ? 1 : 0.5
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10}}>
              <div>
                <div style={{fontWeight: 700, fontSize: 14, color: 'white'}}>{p.nom}</div>
                <div style={{fontSize: 11, color: '#888'}}>{p.categorie_nom || 'Sans catégorie'} · {p.type} {!p.est_actif && '· désactivé'}</div>
              </div>
              <div style={{display: 'flex', gap: 6}}>
                <button onClick={() => toggleActif(p)} style={{
                  padding: '6px 12px', background: 'none', border: '1px solid #555', color: '#ccc',
                  borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600
                }}>
                  {p.est_actif ? 'Désactiver' : 'Réactiver'}
                </button>
                <button onClick={() => supprimer(p)} style={{
                  padding: '6px 12px', background: 'none', border: '1px solid #f28b8b', color: '#f28b8b',
                  borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600
                }}>
                  Supprimer
                </button>
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 8, alignItems: 'end'}}>
              <div>
                <label style={{fontSize: 10, color: '#888', display: 'block', marginBottom: 3}}>Prix normal</label>
                <input type="number" style={inputStyle} value={valeur(p, 'prix')} onChange={e => majEdit(p.id, 'prix', e.target.value)} />
              </div>
              <div>
                <label style={{fontSize: 10, color: '#E63946', display: 'block', marginBottom: 3}}>Prix promo (vide = aucune)</label>
                <input type="number" style={inputStyle} value={valeur(p, 'prix_promo')} onChange={e => majEdit(p.id, 'prix_promo', e.target.value)} />
              </div>
              <div>
                <label style={{fontSize: 10, color: '#888', display: 'block', marginBottom: 3}}>Stock</label>
                <input type="number" style={inputStyle} value={valeur(p, 'stock')} onChange={e => majEdit(p.id, 'stock', e.target.value)} />
              </div>
              <button onClick={() => enregistrerLigne(p)} style={{
                padding: '8px 14px', background: '#1D9E75', color: 'white', border: 'none',
                borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700
              }}>
                Enregistrer
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 8, marginTop: 10}}>
              <div>
                <label style={{fontSize: 10, color: '#888', display: 'block', marginBottom: 3}}>Photo principale (URL)</label>
                <input style={inputStyle} value={valeur(p, 'image_principale')} onChange={e => majEdit(p.id, 'image_principale', e.target.value)} />
              </div>
              <div>
                <label style={{fontSize: 10, color: '#888', display: 'block', marginBottom: 3}}>Vidéo (YouTube ou lien direct)</label>
                <input style={inputStyle} value={valeur(p, 'video_url')} onChange={e => majEdit(p.id, 'video_url', e.target.value)} />
              </div>
              <div style={{gridColumn: '1 / -1'}}>
                <label style={{fontSize: 10, color: '#888', display: 'block', marginBottom: 3}}>Photos supplémentaires — une URL par ligne</label>
                <textarea style={{...inputStyle, width: '100%', minHeight: 50, resize: 'vertical', fontFamily: 'inherit'}} value={valeurImages(p)} onChange={e => majEdit(p.id, 'images', e.target.value)} />
              </div>
              {p.type === 'physique' && (
                <div style={{gridColumn: '1 / -1'}}>
                  <label style={{fontSize: 10, color: '#888', display: 'block', marginBottom: 3}}>Couleurs disponibles — séparées par des virgules</label>
                  <input style={{...inputStyle, width: '100%'}} value={valeurCouleurs(p)} onChange={e => majEdit(p.id, 'couleurs', e.target.value)} />
                  {valeurCouleurs(p).trim() && (
                    <div style={{display: 'flex', gap: 6, marginTop: 6}}>
                      {valeurCouleurs(p).split(',').map(s => s.trim()).filter(Boolean).map((c, i) => (
                        <span key={i} title={c} style={{width: 18, height: 18, borderRadius: '50%', background: colorHex(c), border: '1px solid #444'}} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {p.prix_promo && Number(p.prix_promo) < Number(p.prix) && (
              <div style={{marginTop: 8, fontSize: 11, color: '#E63946', fontWeight: 600}}>
                🔥 Promo active : {fmt(p.prix_promo)} au lieu de {fmt(p.prix)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
