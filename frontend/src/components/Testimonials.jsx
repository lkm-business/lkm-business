import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';

export default function Testimonials() {
  const [avis, setAvis] = useState([]);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const charger = () => API.get('/avis').then(r => setAvis(r.data)).catch(() => {});
  useEffect(() => { charger(); }, []);

  const envoyer = async (e) => {
    e.preventDefault();
    if (!note) return toast.error('Choisis une note');
    if (!commentaire.trim()) return toast.error('Écris un commentaire');
    setLoading(true);
    try {
      await API.post('/avis', { note, commentaire });
      toast.success('Merci pour ton avis !');
      setCommentaire('');
      setNote(0);
      charger();
    } catch {
      toast.error("Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding: '28px 24px'}}>
      <h2 style={{fontSize: 18, fontWeight: 700, marginBottom: 14, color: 'white'}}>💬 Avis clients</h2>

      {avis.length === 0 ? (
        <p style={{color: '#cbd5d2', fontSize: 13, marginBottom: 20}}>Aucun avis pour le moment. Sois le premier à en laisser un !</p>
      ) : (
        <div className="carousel-track" style={{display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 10, marginBottom: 24}}>
          {avis.map(a => (
            <div key={a.id} style={{minWidth: 230, maxWidth: 230, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, flexShrink: 0}}>
              <div style={{color: '#FFD54A', fontSize: 14, marginBottom: 8}}>{'★'.repeat(a.note)}{'☆'.repeat(5 - a.note)}</div>
              <p style={{fontSize: 13, color: 'white', marginBottom: 10, lineHeight: 1.4}}>{a.commentaire}</p>
              <div style={{fontSize: 12, color: '#cbd5d2', fontWeight: 600}}>{a.nom}</div>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={envoyer} style={{background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 16, maxWidth: 400}}>
          <div style={{fontSize: 13, fontWeight: 600, color: 'white', marginBottom: 8}}>Laisser un avis</div>
          <div style={{display: 'flex', gap: 4, marginBottom: 10}}>
            {[1, 2, 3, 4, 5].map(n => (
              <button type="button" key={n} onClick={() => setNote(n)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: n <= note ? '#FFD54A' : '#555'}}>★</button>
            ))}
          </div>
          <textarea
            value={commentaire}
            onChange={e => setCommentaire(e.target.value)}
            placeholder="Ton expérience avec LKM_BUSINESS..."
            style={{width: '100%', minHeight: 70, padding: 10, borderRadius: 8, border: '1px solid #333', background: '#111', color: 'white', fontSize: 13, marginBottom: 10, boxSizing: 'border-box', resize: 'vertical'}}
          />
          <button disabled={loading} style={{padding: '9px 18px', background: '#1D9E75', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer'}}>
            {loading ? 'Envoi...' : 'Publier mon avis'}
          </button>
        </form>
      ) : (
        <p style={{fontSize: 13, color: '#cbd5d2'}}>
          <a href="/connexion" style={{color: '#2DD4A7', fontWeight: 600}}>Connecte-toi</a> pour laisser un avis.
        </p>
      )}
    </div>
  );
}
