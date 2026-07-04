import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Ajouter le token automatiquement
API.interceptors.request.use(config => {
  const token = localStorage.getItem('lkm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Gérer les erreurs 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lkm_token');
      localStorage.removeItem('lkm_user');
      window.location.href = '/connexion';
    }
    return Promise.reject(err);
  }
);

export default API;
