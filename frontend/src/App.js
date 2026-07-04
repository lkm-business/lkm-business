import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Boutique from './pages/Boutique';
import Connexion from './pages/Connexion';
import Compte from './pages/Compte';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/connexion" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="bottom-center" toastOptions={{ style: { background: '#1D9E75', color: 'white', fontWeight: 500 } }} />
          <Navbar />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Boutique />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/compte" element={<ProtectedRoute><Compte /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/commande/succes" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
