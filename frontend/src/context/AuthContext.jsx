import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lkm_token');
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('lkm_token')).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    localStorage.setItem('lkm_token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const register = async (name, email, password, phone) => {
    const r = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('lkm_token', r.data.token);
    setUser(r.data.user);
    return r.data;
  };

  const logout = () => { localStorage.removeItem('lkm_token'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
