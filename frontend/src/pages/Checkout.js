import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const WAVE_LINK = 'https://pay.wave.com/m/M_sn_3uSEmuGc6L2n/c/sn/';
const ORANGE_MONEY_NUMBER = '221784358021';

export default function Checkout() {
  const { items, total, vider } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [methode, setMethode] = useState('');
  const [adresse, setAdresse] = useState('');
  const [loading, setLoading] = useState(false);
  const [omConfirm, setOmConfirm] = useState(null);

  const fmt = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

  const passer = async () => {
    if (!methode) return toast.error('Choisir une méthode de paiement');
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
        adresse_livraison: { adresse }
      });

      if (methode === 'stripe') {
        const pay = await API.post('/paiements/stripe', {
          montant: total,
          commande_id: data.commande.id,
          email: user.email
        });
        window.location.href = pay.data.url;
      } else if (methode === 'wave') {
        vider();
        toast.success('Commande enregistrée ! Redirection vers Wave...');
        window.location.href = WAVE_LINK;
      } else if (methode === 'orange_money') {
        vider();
        setOmConfirm({ montant: total });
      } else {
        toast.success('Commande enregistrée ! Nous vous contacterons pour le paiement.');
        vider();
        navigate('/compte');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la commande');
    } finally {
      setLoading(false);
    }
  };

  if (omConfirm) return (
    <div style={{maxWidth: 460, margin: '48px auto', padding: '0 20px', textAlign: 'center'}}>
      <div style={{fontSize: 40, marginBottom: 12}}>🧡</div>
      <h2 style={{color: 'white', fontSize: 18, fontWeight: 600, marginBottom: 10}}>Finalise ton paiement Orange Money</h2>
      <p style={{color: '#cbd5d2', fontSize: 14, marginBottom: 10}}>
        Envoie <strong style={{color: '#2DD4A7'}}>{fmt(omConfirm.montant)}</strong> au numéro :
      </p>
      <div style={{background: 'white', borderRadius: 10, padding: '14px 20px', fontSize: 22, fontWeight: 700, color: '#FF7900', marginBottom: 16, letterSpacing: 1}}>
        {ORANGE_MONEY_NUMBER}
      </div>
      <p style={{color: '#999', fontSize: 12, marginBottom: 24}}>Tes accès seront activés dès réception du paiement.</p>
      <button onClick={() => navigate('/compte')} style={{padding: '11px 24px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer'}}>
        Aller à mon compte
      </button>
    </div>
  );

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
    { id:'wave', label:'Wave', ico:'🌊', desc:'Paiement via lien Wave sécurisé' },
    { id:'orange_money', label:'Orange Money', ico:'🧡', desc:`Envoi direct au ${ORANGE_MONEY_NUMBER}` },
    { id:'stripe', label:'Carte bancaire', ico:'💳', desc:'Visa, Mastercard via Stripe' },
    { id:'paypal', label:'PayPal', ico:'🅿️', desc:'Paiement PayPal' },
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
