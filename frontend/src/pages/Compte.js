import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Compte() {
  const { user } = useAuth();
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);

  const charger = async () => {
    try { const r = await API.get('/abonnements'); setAbonnements(r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, []);

  const renouveler = async (id, nom) => {
    try {
      await API.post(`/abonnements/${id}/renouveler`);
      toast.success(nom + ' renouvelé !');
      charger();
    } catch { toast.error('Erreur renouvellement'); }
  };

  const fmtD = d => new Date(d).toLocaleDateString('fr-FR');

  return (
    <div style={{maxWidth:680,margin:'32px auto',padding:'0 20px'}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <div style={{width:44,height:44,borderRadius:'50%',background:'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:500,fontSize:16,color:'#0F6E56'}}>
          {user?.nom?.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2)}
        </div>
        <div>
          <div style={{fontWeight:500,fontSize:15,color:'white'}}>{user?.nom}</div>
          <div style={{fontSize:12,color:'#cbd5d2'}}>{user?.email}</div>
        </div>
      </div>

      <h3 style={{fontSize:14,fontWeight:500,marginBottom:12,color:'white'}}>📅 Mes abonnements</h3>

      {loading ? <p style={{color:'#cbd5d2'}}>Chargement...</p>
      : abonnements.length === 0 ? (
        <div style={{textAlign:'center',padding:'40px 0',color:'#cbd5d2'}}>
          <div style={{fontSize:32,marginBottom:8}}>📺</div>
          <p>Aucun abonnement actif</p>
          <p style={{fontSize:12}}>Abonnez-vous depuis la boutique</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {abonnements.map(a => {
            const j = Math.round(a.jours_restants);
            const expire = j < 0;
            const alerte = j >= 0 && j <= 2;
            const actif = j > 0;
            return (
              <div key={a.id} style={{
                background:'white',
                border: alerte ? '0.5px solid #EF9F27' : '0.5px solid #e5e5e5',
                borderLeft: alerte ? '3px solid #EF9F27' : undefined,
                borderRadius: alerte ? '0 12px 12px 0' : 12,
                padding:'12px 14px',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'
              }}>
                <div style={{flex:1}}>
                  <div style={{fontWeight:500,fontSize:13,marginBottom:2}}>{a.nom_abonnement}</div>
                  <div style={{fontSize:11,color:'#888'}}>
                    📅 {fmtD(a.date_debut)} → ⏱ {fmtD(a.date_expiration)}
                  </div>
                </div>
                <span style={{
                  padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:500,
                  background:expire?'#FCEBEB':alerte?'#FAEEDA':'#E1F5EE',
                  color:expire?'#A32D2D':alerte?'#854F0B':'#0F6E56'
                }}>
                  {expire?'Expiré':alerte?(j===0?"Auj.":j===1?'Demain':'2j'):'Actif'}
                </span>
                {actif && (
                  <button onClick={()=>renouveler(a.id,a.nom_abonnement)} style={{
                    padding:'5px 10px',border:'0.5px solid #1D9E75',borderRadius:8,
                    background:'none',color:'#0F6E56',cursor:'pointer',fontSize:12,fontWeight:500
                  }}>
                    🔄 Renouveler
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
