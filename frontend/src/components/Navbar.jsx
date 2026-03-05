import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import AuthModal from './AuthModal';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [authMode, setAuthMode] = useState(null); // 'login' | 'signup' | null

  // Read search param from URL on mount and when location changes
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam && location.pathname === '/products') {
      setSearchQuery(searchParam);
    } else if (location.pathname !== '/products') {
      setSearchQuery('');
    }
  }, [searchParams, location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const openModal = (mode) => setAuthMode(mode);
  const closeModal = () => setAuthMode(null);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-dark border-b border-border sticky top-0 z-50 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to={isAdmin ? "/admin/dashboard" : "/"} className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent whitespace-nowrap">
            JK Electrical & Hardwares
          </Link>

          {/* Search Box - Only for customers (not logged in or customer role) */}
          {!isAdmin && (
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4 hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 bg-bgSecondary/70 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-neon/40 focus:border-transparent text-textPrimary placeholder-textMuted"
                />
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textMuted hover:text-primary-400 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* Right-aligned navigation items */}
          <div className="flex items-center space-x-4 md:space-x-6 ml-auto">
            {user ? (
              isAdmin ? (
                // Admin Navbar Items
                <>
                  <Link to="/admin/dashboard" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Products
                  </Link>
                  <Link to="/admin/orders" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Orders
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm whitespace-nowrap">
                    Logout
                  </button>
                </>
              ) : (
                // Customer Navbar Items
                <>
                  <Link to="/" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Home
                  </Link>
                  <Link to="/products" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Products
                  </Link>
                  <Link to="/profile" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Profile
                  </Link>
                  <Link to="/orders" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                    Orders
                  </Link>
                  <Link to="/cart" className="relative whitespace-nowrap">
                    <svg className="w-6 h-6 hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {cartItemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-primary-500 text-textPrimary text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </Link>
                  <button onClick={handleLogout} className="btn-secondary text-sm whitespace-nowrap">
                    Logout
                  </button>
                </>
              )
            ) : (
              // Not logged in - Modal triggers instead of Links
              <>
                <Link to="/products" className="hover:text-primary-400 transition-colors whitespace-nowrap">
                  Products
                </Link>
                <button
                  onClick={() => openModal('login')}
                  className="hover:text-primary-400 transition-colors whitespace-nowrap"
                >
                  Login
                </button>
                <button
                  onClick={() => openModal('signup')}
                  className="btn-primary text-sm whitespace-nowrap"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {authMode && (
        <AuthModal mode={authMode} onClose={closeModal} />
      )}
    </motion.nav>
  );
};

export default Navbar;
