import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    if (location.state?.orderId) {
      setTimeout(() => {
        toast.success('Order placed successfully!');
      }, 500);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'text-warning';
      case 'Paid':
        return 'text-info';
      case 'Ready for Pickup':
        return 'text-success';
      case 'Collected':
        return 'text-textMuted';
      default:
        return 'text-textMuted';
    }
  };

  const downloadInvoice = (invoiceUrl) => {
    if (invoiceUrl) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      window.open(`${apiUrl}${invoiceUrl}`, '_blank');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-dark rounded-xl p-12 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
          <p className="text-textSecondary">Start shopping to see your orders here!</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-dark rounded-xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Order #{order._id.slice(-8)}</h3>
                  <p className="text-textSecondary text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`font-semibold ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  {order.paymentStatus === 'Paid' && (
                    <span className="ml-4 text-success text-sm">✓ Paid</span>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-4">
                {order.items.map((item) => (
                  <div key={item._id || item.product} className="flex justify-between mb-2">
                    <span className="text-textSecondary">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-textPrimary">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-border pt-4">
                <div>
                  <p className="text-textSecondary">Total Amount</p>
                  <p className="text-2xl font-bold text-primary-400">₹{order.totalAmount.toFixed(2)}</p>
                </div>
                {order.invoiceUrl && (
                  <button
                    onClick={() => downloadInvoice(order.invoiceUrl)}
                    className="btn-secondary"
                  >
                    Download Invoice
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
