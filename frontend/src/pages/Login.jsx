import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = new URLSearchParams(window.location.search).get('from') || '/compte';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Connecté !');
      navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Connexion</h1>
        <p>Accédez à vos abonnements et commandes</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="exemple@email.com" required />
          <label>Mot de passe</label>
          <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          <button type="submit" disabled={loading}>{loading ? 'Connexion...' : 'Se connecter'}</button>
        </form>
        <p>Pas de compte ? <Link to="/inscription">Créer un compte</Link></p>
      </div>
    </main>
  );
}
