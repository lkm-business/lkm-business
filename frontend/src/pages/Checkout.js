import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, vider } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [methode, setMethode] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState({ nom: '', telephone: '', email: '' });

  const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

  const passer = async () => {
    if (!methode) return toast.error('Choisir une méthode de paiement');
    if (!user) {
      if (!invite.nom.trim() || !invite.telephone.trim())
        return toast.error('Nom et téléphone requis pour commander');
      if (methode === 'cinetpay' && !invite.email.trim())
        return toast.error('Email requis pour le paiement en ligne');
    }
    setLoading(true);
    try {
      const articles = items.map(i => ({
        produit_id: i.produit_id,
        formule_iptv_id: i.formule_iptv_id,
        nom: i.nom,
        prix: i.prix,
        quantite: i.quantite,
        type: i.type,
        duree_jours: i.days
      }));

      const { data } = await API.post('/commandes', {
        articles,
        methode_paiement: methode,
        adresse_livraison: { adresse },
        ...(!user && { client: invite }),
      });

      if (methode === 'cinetpay') {
        const pay = await API.post('/paiements/cinetpay', {
          montant: total,
          commande_id: data.commande.id,
          description: `Commande LKM_BUSINESS #${data.commande.numero}`,
          ...(!user && { client: invite }),
        });
        vider();
        window.location.href = pay.data.url;
      } else {
        toast.success('Commande enregistrée ! Nous vous contacterons pour le paiement.');
        vider();
        navigate('/commande/succes');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) return (
    <div style={{textAlign:'center',padding:'60px 20px',color:'#cbd5d2'}}>
      <div style={{fontSize:40,marginBottom:12}}>🛒</div>
      <p>Votre panier est vide</p>
      <button onClick={()=>navigate('/')} style={{marginTop:12,padding:'9px 20px',background:'#1D9E75',color:'white',border:'none',borderRadius:8,cursor:'pointer'}}>
        Retour à la boutique
      </button>
    </div>
  );

  const METHODES = [
    { id:'cinetpay', label:'Payer en ligne', ico:'💳', desc:'Wave, Orange Money ou carte bancaire — paiement sécurisé' },
    { id:'livraison', label:'Paiement à la livraison', ico:'🚚', desc:'Cash ou mobile à la réception' },
  ];

  return (
    <div style={{maxWidth:580,margin:'32px auto',padding:'0 20px'}}>
      <h2 style={{fontSize:18,fontWeight:500,marginBottom:20,color:'white'}}>Finaliser la commande</h2>

      <div style={{background:'white',border:'0.5px solid #e5e5e5',borderRadius:12,padding:16,marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>Récapitulatif</div>
        {items.map(i => (
          <div key={i.key} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'0.5px solid #f0f0f0',fontSize:13}}>
            <span>{i.nom} {i.quantite > 1 && `×${i.quantite}`}</span>
            <span style={{color:'#0F6E56',fontWeight:500}}>{fmt(i.prix * i.quantite)}</span>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,fontWeight:500}}>
          <span>Total</span><span style={{color:'#0F6E56'}}>{fmt(total)}</span>
        </div>
      </div>

      {!user && (
        <div style={{background:'white',border:'0.5px solid #e5e5e5',borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>Vos informations</div>
          <div style={{fontSize:11,color:'#888',marginBottom:10}}>Pas besoin de compte — remplis juste ces infos pour qu'on te contacte.</div>
          <input value={invite.nom} onChange={e=>setInvite(v=>({...v, nom: e.target.value}))} placeholder="Nom complet *"
            style={{width:'100%',padding:'8px 12px',border:'0.5px solid #ddd',borderRadius:8,fontSize:13,boxSizing:'border-box',outline:'none',marginBottom:8}} />
          <input value={invite.telephone} onChange={e=>setInvite(v=>({...v, telephone: e.target.value}))} placeholder="Téléphone (WhatsApp de préférence) *"
            style={{width:'100%',padding:'8px 12px',border:'0.5px solid #ddd',borderRadius:8,fontSize:13,boxSizing:'border-box',outline:'none',marginBottom:8}} />
          <input value={invite.email} onChange={e=>setInvite(v=>({...v, email: e.target.value}))} placeholder={methode === 'cinetpay' ? 'Email * (requis pour le paiement en ligne)' : 'Email (optionnel)'}
            style={{width:'100%',padding:'8px 12px',border:'0.5px solid #ddd',borderRadius:8,fontSize:13,boxSizing:'border-box',outline:'none'}} />
        </div>
      )}

      {items.some(i => i.type === 'physique') && (
        <div style={{background:'white',border:'0.5px solid #e5e5e5',borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:10}}>Adresse de livraison</div>
          <textarea value={adresse} onChange={e=>setAdresse(e.target.value)} placeholder="Votre adresse complète..."
            style={{width:'100%',padding:'8px 12px',border:'0.5px solid #ddd',borderRadius:8,fontSize:13,minHeight:80,boxSizing:'border-box',outline:'none',resize:'vertical'}} />
        </div>
      )}

      <div style={{background:'white',border:'0.5px solid #e5e5e5',borderRadius:12,padding:16,marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:500,marginBottom:12}}>Méthode de paiement</div>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {METHODES.map(m => (
            <button key={m.id} onClick={()=>setMethode(m.id)} style={{
              padding:'10px 14px',border: methode===m.id ? '2px solid #1D9E75' : '0.5px solid #ddd',
              borderRadius:10,background: methode===m.id ? '#E1F5EE' : 'none',
              cursor:'pointer',display:'flex',alignItems:'center',gap:10,textAlign:'left'
            }}>
              <span style={{fontSize:20}}>{m.ico}</span>
              <div>
                <div style={{fontSize:13,fontWeight:500,color: methode===m.id ? '#0F6E56':'#333'}}>{m.label}</div>
                <div style={{fontSize:11,color:'#888'}}>{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button onClick={passer} disabled={loading || !methode} style={{
        width:'100%',padding:12,background: methode ? '#1D9E75' : '#ccc',
        color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:500,
        cursor: methode ? 'pointer' : 'not-allowed'
      }}>
        {loading ? 'Traitement...' : `Confirmer — ${fmt(total)}`}
      </button>
    </div>
  );
}
