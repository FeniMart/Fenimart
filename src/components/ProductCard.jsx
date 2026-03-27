import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, Star, Sparkles, Heart } from 'lucide-react';
import { addToCart } from '../lib/cart';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const email = localStorage.getItem('user_email') || prompt('Enter your email to get notified when back in stock:');
    if (!email) return;
    
    localStorage.setItem('user_email', email);
    
    try {
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, user_email: email })
      });
      setWishlisted(true);
      setShowWishlist(true);
      setTimeout(() => setShowWishlist(false), 3000);
    } catch (err) {
      console.error('Wishlist error:', err);
    }
  };

  const isOutOfStock = product.id % 7 === 0;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-soft card-hover relative"
    >
      {isOutOfStock && (
        <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
          Out of Stock
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <div className="relative h-56 overflow-hidden">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isOutOfStock ? 'opacity-60' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {product.featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-semibold shadow-lg">
              <Sparkles className="w-3.5 h-3.5" />
              Featured
            </div>
          )}

          <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            4.9
          </div>

          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
            <button 
              onClick={(e) => e.preventDefault()}
              className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Eye className="w-5 h-5 text-gray-700" />
            </button>
            {!isOutOfStock && (
              <button 
                onClick={handleAddToCart}
                className="w-12 h-12 rounded-2xl btn-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <ShoppingCart className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-[#FF6B6B] uppercase tracking-wider">
              {product.category}
            </span>
          </div>
          
          <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-[#FF6B6B] transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <span className="text-2xl font-bold gradient-text">
                ${parseFloat(product.price).toFixed(2)}
              </span>
            </div>
            {isOutOfStock ? (
              <button
                onClick={handleWishlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  wishlisted 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-500' : ''}`} />
                {wishlisted ? 'Wishlisted' : 'Notify Me'}
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors group-hover:btn-primary group-hover:text-white"
              >
                <ShoppingCart className="w-4 h-4" />
                Add
              </button>
            )}
          </div>
        </div>
      </Link>

      {showWishlist && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-4 left-4 right-4 bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-medium text-center shadow-lg"
        >
          ✓ You'll be notified when back in stock!
        </motion.div>
      )}
    </motion.div>
  );
}
