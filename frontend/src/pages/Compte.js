import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

const resizePhoto = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = reject;
  reader.onload = () => {
    const img = new Image();
    img.onerror = reject;
    img.onload = () => {
      const taille = 300;
      const canvas = document.createElement('canvas');
      canvas.width = taille;
      canvas.height = taille;
      const ctx = canvas.getContext('2d');
      const ratio = Math.max(taille / img.width, taille / img.height);
      const w = img.width * ratio, h = img.height * ratio;
      ctx.drawImage(img, (taille - w) / 2, (taille - h) / 2, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

export default function Compte() {
  const { user, deconnexion } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [profil, setProfil] = useState(null);
  const [form, setForm] = useState({ nom: '', telephone: '', adresse: '' });
  const [photo, setPhoto] = useState(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const [abonnements, setAbonnements] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDesactiver, setConfirmDesactiver] = useState(false);

  const charger = async () => {
    try {
      const [pRes, aRes, cRes] = await Promise.all([
        API.get('/auth/profil'),
        API.get('/abonnements'),
        API.get('/commandes'),
      ]);
      setProfil(pRes.data);
      setForm({ nom: pRes.data.nom || '', telephone: pRes.data.telephone || '', adresse: pRes.data.adresse || '' });
      setPhoto(pRes.data.photo || null);
      setAbonnements(aRes.data);
      setCommandes(cRes.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const renouveler = async (id, nom) => {
    try {
      await API.post(`/abonnements/${id}/renouveler`);
      toast.success(nom + ' renouvelé !');
      charger();
    } catch { toast.error('Erreur renouvellement'); }
  };

  const choisirPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizePhoto(file);
      setPhoto(dataUrl);
    } catch { toast.error('Impossible de charger cette image'); }
  };

  const enregistrerProfil = async () => {
    setEnregistrement(true);
    try {
      await API.put('/auth/profil', { ...form, photo });
      toast.success('Profil mis à jour !');
      charger();
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setEnregistrement(false); }
  };

  const desactiverCompte = async () => {
    try {
      await API.post('/auth/desactiver');
      toast.success('Compte désactivé');
      deconnexion();
      navigate('/');
    } catch { toast.error('Erreur lors de la désactivation'); }
  };

  const fmtD = d => new Date(d).toLocaleDateString('fr-FR');
  const fmtM = n => Number(n).toLocaleString('fr-FR') + ' FCFA';

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #333',
    background: '#1a1a1a', color: 'white', fontSize: 13, marginBottom: 10, boxSizing: 'border-box'
  };
  const labelStyle = { fontSize: 11, color: '#999', marginBottom: 4, display: 'block' };

  if (loading) return <div style={{maxWidth:680,margin:'32px auto',padding:'0 20px',color:'#cbd5d2'}}>Chargement...</div>;

  return (
    <div style={{maxWidth:680,margin:'32px auto',padding:'0 20px 60px'}}>
      {/* Profil */}
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:'white'}}>👤 Mon profil</h3>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20}}>
        <div onClick={() => fileRef.current?.click()} style={{
          width:76,height:76,borderRadius:'50%',overflow:'hidden',cursor:'pointer',flexShrink:0,
          background:'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',border:'2px solid #1D9E75'
        }}>
          {photo ? (
            <img src={photo} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} />
          ) : (
            <span style={{fontWeight:600,fontSize:22,color:'#0F6E56'}}>
              {user?.nom?.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)}
            </span>
          )}
        </div>
        <div>
          <button onClick={() => fileRef.current?.click()} style={{
            padding:'7px 14px',border:'1px solid #1D9E75',borderRadius:8,background:'none',
            color:'#2DD4A7',cursor:'pointer',fontSize:12,fontWeight:600
          }}>
            📷 Changer la photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={choisirPhoto} style={{display:'none'}} />
          <div style={{fontSize:11,color:'#888',marginTop:6}}>{profil?.email}</div>
        </div>
      </div>

      <label style={labelStyle}>Nom complet</label>
      <input style={inputStyle} value={form.nom} onChange={e => setForm(f => ({...f, nom: e.target.value}))} />

      <label style={labelStyle}>Téléphone</label>
      <input style={inputStyle} value={form.telephone} onChange={e => setForm(f => ({...f, telephone: e.target.value}))} />

      <label style={labelStyle}>Adresse</label>
      <input style={inputStyle} value={form.adresse} onChange={e => setForm(f => ({...f, adresse: e.target.value}))} />

      <button onClick={enregistrerProfil} disabled={enregistrement} style={{
        padding:'10px 18px',background:'#1D9E75',color:'white',border:'none',borderRadius:8,
        fontSize:13,fontWeight:600,cursor: enregistrement ? 'default' : 'pointer',opacity: enregistrement ? 0.7 : 1,marginBottom:32
      }}>
        {enregistrement ? 'Enregistrement...' : 'Enregistrer le profil'}
      </button>

      {/* Abonnements */}
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:'white'}}>📅 Mes abonnements</h3>
      {abonnements.length === 0 ? (
        <div style={{textAlign:'center',padding:'30px 0',color:'#cbd5d2'}}>
          <div style={{fontSize:28,marginBottom:6}}>📺</div>
          <p style={{fontSize:13}}>Aucun abonnement actif</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:32}}>
          {abonnements.map(a => {
            const j = Math.round(a.jours_restants);
            const expire = j < 0;
            const alerte = j >= 0 && j <= 2;
            const actif = j > 0;
            return (
              <div key={a.id} style={{
                background:'#111',
                border: alerte ? '0.5px solid #EF9F27' : '0.5px solid #262626',
                borderLeft: alerte ? '3px solid #EF9F27' : undefined,
                borderRadius: alerte ? '0 12px 12px 0' : 12,
                padding:'12px 14px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'
              }}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,fontSize:13,marginBottom:2,color:'white'}}>{a.nom_abonnement}</div>
                  <div style={{fontSize:11,color:'#888'}}>
                    📅 {fmtD(a.date_debut)} → ⏱ {fmtD(a.date_expiration)}
                  </div>
                </div>
                <span style={{
                  padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:500,
                  background:expire?'#3a1c1c':alerte?'#3a2f14':'#123a2c',
                  color:expire?'#f28b8b':alerte?'#f2c14e':'#2DD4A7'
                }}>
                  {expire?'Expiré':alerte?(j===0?"Auj.":j===1?'Demain':'2j'):'Actif'}
                </span>
                {actif && (
                  <button onClick={()=>renouveler(a.id,a.nom_abonnement)} style={{
                    padding:'5px 10px',border:'0.5px solid #1D9E75',borderRadius:8,
                    background:'none',color:'#2DD4A7',cursor:'pointer',fontSize:12,fontWeight:500
                  }}>
                    🔄 Renouveler
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Historique des commandes */}
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:'white'}}>🧾 Historique des paiements</h3>
      {commandes.length === 0 ? (
        <div style={{textAlign:'center',padding:'30px 0',color:'#cbd5d2',marginBottom:32}}>
          <div style={{fontSize:28,marginBottom:6}}>🧾</div>
          <p style={{fontSize:13}}>Aucune commande pour le moment</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:32}}>
          {commandes.map(c => (
            <div key={c.id} style={{
              background:'#111',border:'0.5px solid #262626',borderRadius:12,padding:'12px 14px'
            }}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6,flexWrap:'wrap',gap:6}}>
                <div style={{fontWeight:600,fontSize:12,color:'white'}}>#{c.numero}</div>
                <div style={{fontSize:11,color:'#888'}}>{fmtD(c.cree_le)}</div>
              </div>
              <div style={{fontSize:11,color:'#aaa',marginBottom:6}}>
                {(c.articles || []).filter(a => a).map(a => a.nom_produit).join(', ')}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontSize:11,color:'#888',textTransform:'capitalize'}}>{c.methode_paiement}</span>
                <span style={{fontWeight:700,fontSize:13,color:'#2DD4A7'}}>{fmtM(c.montant_total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone dangereuse */}
      <h3 style={{fontSize:14,fontWeight:600,marginBottom:12,color:'#f28b8b'}}>⚠️ Zone dangereuse</h3>
      <div style={{background:'#1a1010',border:'1px solid #3a1c1c',borderRadius:12,padding:14}}>
        <p style={{fontSize:12,color:'#cbb',marginBottom:12}}>
          Désactiver ton compte le rendra inaccessible. Contacte le support pour le réactiver.
        </p>
        {!confirmDesactiver ? (
          <button onClick={() => setConfirmDesactiver(true)} style={{
            padding:'9px 16px',background:'none',border:'1px solid #f28b8b',color:'#f28b8b',
            borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:600
          }}>
            Désactiver mon compte
          </button>
        ) : (
          <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
            <span style={{fontSize:12,color:'#f28b8b',fontWeight:600}}>Confirmer la désactivation ?</span>
            <button onClick={desactiverCompte} style={{
              padding:'7px 14px',background:'#f28b8b',border:'none',color:'#1a1010',
              borderRadius:8,cursor:'pointer',fontSize:12,fontWeight:700
            }}>
              Oui, désactiver
            </button>
            <button onClick={() => setConfirmDesactiver(false)} style={{
              padding:'7px 14px',background:'none',border:'1px solid #555',color:'#ccc',
              borderRadius:8,cursor:'pointer',fontSize:12
            }}>
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
