import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, cartTotal, fetchCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login', { state: { from: 'checkout' } });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return; // Will redirect from above useEffect
    
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate, user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.body.appendChild(script);
    });
  };

  const handleCreateOrder = async () => {
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setLoading(true);

      // Step 1: Create order in our database
      const orderResponse = await axios.post('/api/orders', {
        shippingAddress: formData,
      });
      const createdOrderId = orderResponse.data.order._id;

      // Step 2: Create Razorpay order
      const paymentResponse = await axios.post('/api/payments/create-order', {
        orderId: createdOrderId,
      });

      // Step 3: Load Razorpay script
      await loadRazorpayScript();

      // Step 4: Open Razorpay payment window
      const options = {
        key: paymentResponse.data.key,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        order_id: paymentResponse.data.orderId,
        handler: async (response) => {
          try {
            // Step 5: Verify payment
            await axios.post('/api/payments/verify', {
              orderId: createdOrderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            await clearCart();
            await fetchCart();
            toast.success('Payment successful! Order details sent to your email.');
            navigate('/orders', { state: { orderId: createdOrderId } });
          } catch (verifyError) {
            toast.error('Payment verification failed. Please contact support.');
            console.error('Verification error:', verifyError);
          }
        },
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: {
          color: '#3b82f6',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
      console.error('Order error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-textSecondary mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-textSecondary mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-textSecondary mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="input-field"
                rows="4"
                required
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-dark rounded-xl p-6"
        >
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.items.map((item) => (
              <div key={item._id} className="flex justify-between">
                <span className="text-textSecondary">
                  {item.product?.name} x {item.quantity}
                </span>
                <span className="text-textPrimary">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 mb-6">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span className="text-primary-400">₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCreateOrder}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
          <p className="text-sm text-textSecondary mt-4 text-center">
            Note: This is a pickup-only order. You will collect items from the shop.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Checkout;
