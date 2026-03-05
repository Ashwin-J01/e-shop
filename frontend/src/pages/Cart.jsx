import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cart, cartTotal, loading, updateCartItem, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = await updateCartItem(itemId, newQuantity);
    if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleRemove = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart');
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-xl p-12 max-w-md mx-auto"
        >
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-textSecondary mb-6">Add some products to get started!</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-dark rounded-xl p-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-bgSecondary/60 flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0].url}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-textMuted">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2">{item.product?.name}</h3>
                  <p className="text-primary-400 text-lg font-bold mb-4">₹{item.price}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="btn-secondary w-8 h-8 p-0"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="btn-secondary w-8 h-8 p-0"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-error hover:text-error/80 text-sm mt-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-xl p-6 sticky top-24"
          >
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-textSecondary">Subtotal</span>
                <span className="text-textPrimary">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textSecondary">Items</span>
                <span className="text-textPrimary">{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary-400">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full text-center block">
              Proceed to Checkout
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
