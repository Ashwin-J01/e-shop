import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AuthModal = ({ mode: initialMode = 'login', onClose }) => {
  const { login, register, googleSignIn } = useAuth();
  const navigate = useNavigate();
  // Manage mode internally to allow switching between login/signup
  const [mode, setMode] = useState(initialMode);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;

    const init = () => {
      if (cancelled) return;

      if (!window.google?.accounts?.id) {
        setTimeout(init, 200);
        return;
      }

      try {
        if (!window.__gisInitialized) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              const result = await googleSignIn(response.credential);
              if (result.success) {
                navigate(result.redirectTo || '/');
                onClose();
              }
            },
          });
          window.__gisInitialized = true;
        }

        const el = document.getElementById('google-signin-btn');
        if (el) {
          el.innerHTML = '';
          window.google.accounts.id.renderButton(el, {
            theme: 'outline',
            size: 'large',
            width: 360,
            text: 'continue_with',
          });
        }
      } catch (e) {
        console.error('Google button init error', e);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [googleSignIn, navigate, onClose]);

  // Reset relevant form data when switching modes
  useEffect(() => {
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
  }, [mode]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (mode === 'login') {
      const result = await login(formData.email, formData.password);
      setLoading(false);
      if (result.success) {
        navigate(result.redirectTo || '/');
        onClose();
      } else {
        toast.error(result.error || 'Login failed');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        setLoading(false);
        return;
      }
      const { confirmPassword, ...userData } = formData;
      const result = await register(userData);
      setLoading(false);
      if (result.success) {
        navigate('/');
        onClose();
      } else {
        toast.error(result.error || 'Registration failed');
      }
    }
  };

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop overflow-y-auto overflow-x-hidden min-h-screen py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          // Added bg-opacity-95 to glass-dark class or inline style to reduce transparency as requested
          className="glass-dark rounded-xl p-8 w-full max-w-md mx-4 backdrop-blur-xl border border-border/40 shadow-2xl relative my-auto"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-textSecondary hover:text-textPrimary transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h1 className="text-3xl font-bold mb-2 text-center text-textPrimary">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-center text-textSecondary mb-8 text-sm">
            {mode === 'login' ? 'Enter your details to access your account' : 'Sign up to start shopping with us'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1.5 ml-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1.5 ml-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                required
                minLength={6}
              />
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-textSecondary mb-1.5 ml-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 text-lg shadow-lg hover:shadow-primary-500/25"
            >
              {loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-5">
            <div id="google-signin-btn" className="flex justify-center" />
            {!import.meta.env?.VITE_GOOGLE_CLIENT_ID && (
              <p className="text-xs text-textMuted text-center mt-2">
                Google sign-in is not configured
              </p>
            )}
          </div>

          {/* Footer - Toggle Mode */}
          <div className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="text-textSecondary">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-primary-400 font-bold hover:text-primary-300 transition-colors hover:underline"
              >
                {mode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
