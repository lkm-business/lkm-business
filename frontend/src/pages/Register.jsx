import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Compte créé !');
      navigate('/compte');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur inscription');
    } finally { setLoading(false); }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) });

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Créer un compte</h1>
        <p>Rejoignez LKM_BUSINESS</p>
        <form onSubmit={submit}>
          <label>Prénom et nom</label>
          <input type="text" {...f('name')} placeholder="ex: Moussa Diallo" required />
          <label>Email</label>
          <input type="email" {...f('email')} placeholder="exemple@email.com" required />
          <label>Téléphone (optionnel)</label>
          <input type="tel" {...f('phone')} placeholder="+221 77 000 00 00" />
          <label>Mot de passe</label>
          <input type="password" {...f('password')} placeholder="Minimum 6 caractères" required minLength={6} />
          <button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer mon compte'}</button>
        </form>
        <p>Déjà un compte ? <Link to="/connexion">Se connecter</Link></p>
      </div>
    </main>
  );
}
