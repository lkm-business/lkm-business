import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('lkm_token');
    if (!token) { setReady(true); return; }
    API.get('/auth/profil')
      .then(r => setUser(r.data))
      .catch(() => localStorage.removeItem('lkm_token'))
      .finally(() => setReady(true));
  }, []);

  const connexion = async (email, mot_de_passe) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/connexion', { email, mot_de_passe });
      localStorage.setItem('lkm_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const inscription = async (nom, email, mot_de_passe, telephone) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/inscription', { nom, email, mot_de_passe, telephone });
      localStorage.setItem('lkm_token', data.token);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Erreur d'inscription" };
    } finally {
      setLoading(false);
    }
  };

  const deconnexion = () => {
    localStorage.removeItem('lkm_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, ready, connexion, inscription, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
