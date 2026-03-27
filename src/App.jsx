import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import supabase from './lib/supabase';
import { handleGoogleRedirect } from './lib/googleAuth';
import Header from './components/Header';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Invoice from './pages/Invoice';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

handleGoogleRedirect();

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onSignOut={handleSignOut} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/invoice/:invoiceNumber" element={<Invoice />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
