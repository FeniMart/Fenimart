import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../lib/supabase';
import { getCartCount } from '../lib/cart';

export default function Header({ user, onSignOut }) {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setCartCount(getCartCount());
    const handleCartUpdate = () => setCartCount(getCartCount());
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'glass shadow-soft py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center shadow-colored group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="font-display text-2xl font-bold gradient-text">
              FeniMart
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/products" 
              className="text-gray-600 hover:text-gray-900 font-medium relative group"
            >
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 btn-primary group-hover:w-full transition-all duration-300" />
            </Link>
            <Link 
              to="/categories" 
              className="text-gray-600 hover:text-gray-900 font-medium relative group"
            >
              Categories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 btn-primary group-hover:w-full transition-all duration-300" />
            </Link>
            {user && (
              <Link 
                to="/orders" 
                className="text-gray-600 hover:text-gray-900 font-medium relative group"
              >
                My Orders
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 btn-primary group-hover:w-full transition-all duration-300" />
              </Link>
            )}
            <Link 
              to="/admin" 
              className="text-gray-600 hover:text-gray-900 font-medium relative group"
            >
              Admin
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 btn-primary group-hover:w-full transition-all duration-300" />
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-700" />
              </div>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 btn-primary text-white text-xs rounded-full flex items-center justify-center font-bold shadow-colored"
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                <Link 
                  to="/account" 
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.email?.split('@')[0]}
                  </span>
                </Link>
                <button 
                  onClick={onSignOut} 
                  className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="md:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-gray-200/50"
          >
            <nav className="px-4 py-6 flex flex-col gap-4">
              <Link to="/products" className="text-gray-700 font-medium py-2">Products</Link>
              <Link to="/categories" className="text-gray-700 font-medium py-2">Categories</Link>
              {user && <Link to="/orders" className="text-gray-700 font-medium py-2">My Orders</Link>}
              <Link to="/admin" className="text-gray-700 font-medium py-2">Admin Dashboard</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
