import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';

export default function Account() {
  const { user, login, register, logout } = useAuth();
  const { setIsOpen } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', phone:'' });
  const [error, setError] = useState('');
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (user) {
      api.get('/subscriptions/my').then(r => setSubs(r.data)).catch(console.error);
      if (params.get('redirect') === 'cart') { setIsOpen(true); navigate('/'); }
    }
  }, [user]);

  const handleSubmit = async () => {
    setError('');
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password, form.phone);
      if (params.get('redirect') === 'cart') { setIsOpen(true); navigate('/'); }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    }
  };

  const daysLeft = (exp) => Math.round((new Date(exp) - new Date()) / 864e5);
  const fmtDate = (d) => new Date(d).toLocaleDateString('fr-FR');

  const renew = async (id) => {
    await api.post(`/subscriptions/renew/${id}`);
    api.get('/subscriptions/my').then(r => setSubs(r.data));
  };

  const expiring = subs.filter(s => { const d = daysLeft(s.expiry_date); return d >= 0 && d <= 2; });

  if (!user) return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>{mode==='login'?'Connexion':'Créer un compte'}</h2>
        <p className="auth-sub">{mode==='login'?'Accédez à vos abonnements':'Rejoignez LKM_BUSINESS'}</p>
        {mode==='register' && <><label>Nom complet</label><input className="f-input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Moussa Diallo"/></>}
        <label>Email</label>
        <input className="f-input" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@exemple.com"/>
        <label>Mot de passe</label>
        <input className="f-input" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••"/>
        {mode==='register' && <><label>Téléphone (optionnel)</label><input className="f-input" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+221 7X XXX XX XX"/></>}
        {error && <p className="err-msg">{error}</p>}
        <button className="f-btn" onClick={handleSubmit}>{mode==='login'?'Se connecter':'Créer mon compte'}</button>
        <p className="auth-toggle">{mode==='login'?'Pas de compte ?':'Déjà un compte ?'} <a onClick={()=>{setMode(mode==='login'?'register':'login');setError('')}}>{mode==='login'?'Créer un compte':'Se connecter'}</a></p>
      </div>
    </div>
  );

  return (
    <div className="dash-page">
      {expiring.length > 0 && (
        <div className="notif-banner">
          {expiring.map(s => {
            const d = daysLeft(s.expiry_date);
            return <div key={s.id} className="notif-item">⚠️ <strong>{s.name}</strong> expire {d===0?"aujourd'hui":d===1?'demain':'dans 2 jours'}. <button onClick={()=>renew(s.id)} className="renew-inline">Renouveler</button></div>;
          })}
        </div>
      )}
      <div className="dash-wrap">
        <div className="dash-top">
          <div className="avatar">{user.name.slice(0,2).toUpperCase()}</div>
          <div><div className="dash-name">{user.name}</div><div className="dash-email">{user.email}</div></div>
          <button className="logout-btn" onClick={logout}>Déconnexion</button>
        </div>
        <div className="stats-row">
          <div className="stat"><div className="stat-l">Actifs</div><div className="stat-v">{subs.filter(s=>daysLeft(s.expiry_date)>0).length}</div></div>
          <div className="stat"><div className="stat-l">Expirent bientôt</div><div className="stat-v">{expiring.length}</div></div>
          <div className="stat"><div className="stat-l">Total dépensé</div><div className="stat-v">{subs.reduce((a,s)=>a+(+s.price||0),0).toLocaleString('fr-FR')} F</div></div>
        </div>
        <h3 className="section-title">📅 Mes abonnements</h3>
        {!subs.length ? (
          <div className="no-subs">📺 Aucun abonnement actif<br/><small>Abonnez-vous depuis la boutique</small></div>
        ) : subs.map((s,i) => {
          const d = daysLeft(s.expiry_date);
          const isActive = d > 0;
          const isExpiring = d >= 0 && d <= 2;
          return (
            <div key={s.id} className={`sub-row ${isExpiring&&isActive?'alert':''}`}>
              <span className="sub-ico">{s.icon}</span>
              <div className="sub-info">
                <div className="sub-name">{s.name}</div>
                <div className="sub-dates">📅 {fmtDate(s.start_date)} → ⏰ {fmtDate(s.expiry_date)}</div>
              </div>
              <span className={`s-badge ${d<0?'err':isExpiring?'warn':'ok'}`}>{d<0?'Expiré':isExpiring?(d===0?"Aujourd'hui":d===1?'Demain':'2 j'):'Actif'}</span>
              {isActive && <button className="renew-btn" onClick={()=>renew(s.id)}>🔄 Renouveler</button>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
