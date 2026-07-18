import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Connexion() {
  const [mode, setMode] = useState('connexion');
  const [form, setForm] = useState({ nom:'', email:'', mot_de_passe:'', telephone:'' });
  const { connexion, inscription, loading } = useAuth();
  const { setOpen } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const set = (k, v) => setForm(f => ({...f, [k]:v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = mode === 'connexion'
      ? await connexion(form.email, form.mot_de_passe)
      : await inscription(form.nom, form.email, form.mot_de_passe, form.telephone);
    if (res.success) {
      toast.success(mode === 'connexion' ? 'Connecté !' : 'Compte créé !');
      if (params.get('redirect') === 'panier') {
        navigate('/');
        setTimeout(() => setOpen(true), 400);
      } else navigate('/compte');
    } else {
      toast.error(res.message);
    }
  };

  const L = {display:'block',fontSize:12,color:'#999',marginBottom:4};
  const I = {width:'100%',padding:'8px 12px',border:'1px solid #333',borderRadius:8,fontSize:13,marginBottom:12,boxSizing:'border-box',outline:'none',background:'#1a1a1a',color:'white'};
  const B = {width:'100%',padding:10,background:'#1D9E75',color:'white',border:'none',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer',marginTop:4};

  return (
    <div style={{maxWidth:380,margin:'48px auto',padding:'0 20px'}}>
      <div style={{background:'#111',border:'1px solid #262626',borderRadius:12,padding:28}}>
        <h2 style={{fontSize:18,fontWeight:500,marginBottom:4,color:'white'}}>
          {mode==='connexion'?'Connexion':'Créer un compte'}
        </h2>
        <p style={{fontSize:13,color:'#888',marginBottom:20}}>
          {mode==='connexion'?'Accédez à vos abonnements LKM_BUSINESS':'Rejoignez LKM_BUSINESS'}
        </p>
        <form onSubmit={handleSubmit}>
          {mode==='inscription' && (<>
            <label style={L}>Prénom et nom</label>
            <input style={I} placeholder="Moussa Diallo" value={form.nom} onChange={e=>set('nom',e.target.value)} required />
            <label style={L}>Téléphone</label>
            <input style={I} placeholder="+221 77 000 00 00" value={form.telephone} onChange={e=>set('telephone',e.target.value)} />
          </>)}
          <label style={L}>Email</label>
          <input style={I} type="email" placeholder="exemple@email.com" value={form.email} onChange={e=>set('email',e.target.value)} required />
          <label style={L}>Mot de passe</label>
          <input style={I} type="password" placeholder="••••••••" value={form.mot_de_passe} onChange={e=>set('mot_de_passe',e.target.value)} required />
          <button type="submit" disabled={loading} style={B}>
            {loading?'Chargement...':(mode==='connexion'?'Se connecter':'Créer mon compte')}
          </button>
        </form>
        <p style={{textAlign:'center',marginTop:14,fontSize:13,color:'#888'}}>
          {mode==='connexion'?'Pas de compte ? ':'Déjà un compte ? '}
          <span style={{color:'#2DD4A7',cursor:'pointer',textDecoration:'underline'}}
            onClick={()=>setMode(mode==='connexion'?'inscription':'connexion')}>
            {mode==='connexion'?'Créer un compte':'Se connecter'}
          </span>
        </p>
      </div>
    </div>
  );
}
