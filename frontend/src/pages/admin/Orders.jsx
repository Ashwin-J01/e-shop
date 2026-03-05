import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Filter, Search, CheckCircle, Clock, Package, Truck, ShoppingBag, ChevronDown } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Paid':
        return 'bg-info/10 text-info border-info/20';
      case 'Ready for Pickup':
        return 'bg-primary-500/10 text-primary-400 border-primary-500/20';
      case 'Collected':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Paid': return <CheckCircle size={16} />;
      case 'Ready for Pickup': return <Package size={16} />;
      case 'Collected': return <Truck size={16} />;
      default: return <ShoppingBag size={16} />;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-bgSecondary/20 p-2 rounded-2xl border border-border/50 backdrop-blur-sm w-fit">
        {['all', 'Pending', 'Paid', 'Ready for Pickup', 'Collected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === status
                ? 'bg-primary-500 text-textPrimary shadow-lg shadow-primary-500/20'
                : 'text-textSecondary hover:text-textPrimary hover:bg-bgSecondary/50'
              }`}
          >
            {status === 'all' ? 'All Orders' : status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-bgSecondary/20 rounded-2xl border border-border/50 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bgSecondary/40 border-b border-border/50 text-textSecondary text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <>
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`hover:bg-bgSecondary/30 transition-colors ${expandedOrder === order._id ? 'bg-bgSecondary/30' : ''}`}
                    >
                      <td className="px-6 py-4 font-mono text-sm text-textSecondary">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-textPrimary">{order.user?.name || 'Guest'}</span>
                          <span className="text-xs text-textSecondary">{order.user?.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-textSecondary">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-primary-400">
                        ₹{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                            className="text-sm text-textSecondary hover:text-primary-400 underline decoration-dotted underline-offset-4"
                          >
                            {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>
                      </td>
                    </motion.tr>

                    {/* Expanded Details Row */}
                    {expandedOrder === order._id && (
                      <tr className="bg-bgSecondary/10">
                        <td colSpan="6" className="px-6 py-4 border-b border-border/30">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 rounded-xl bg-bg/50 border border-border/30">
                              <h4 className="text-sm font-semibold text-textSecondary mb-3 uppercase tracking-wider">Order Items</h4>
                              <div className="space-y-2 mb-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                      <span className="bg-bgSecondary w-6 h-6 rounded flex items-center justify-center text-xs border border-border">
                                        {item.quantity}x
                                      </span>
                                      <span className="text-textPrimary">{item.name}</span>
                                    </div>
                                    <span className="text-textSecondary">₹{(item.price * item.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-end gap-3 pt-4 border-t border-border/30">
                                {order.status === 'Pending' && (
                                  <span className="text-xs text-textSecondary italic">Payment is set when customer places order.</span>
                                )}
                                {order.status === 'Paid' && (
                                  <button
                                    onClick={() => handleStatusUpdate(order._id, 'Ready for Pickup')}
                                    className="px-4 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-primary-500/20"
                                  >
                                    Ready for Pickup
                                  </button>
                                )}
                                {order.status === 'Ready for Pickup' && (
                                  <button
                                    onClick={() => handleStatusUpdate(order._id, 'Collected')}
                                    className="px-4 py-2 bg-success/10 hover:bg-success/20 text-success text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-success/20"
                                  >
                                    Mark as Collected
                                  </button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-textSecondary">
            <ShoppingBag size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No orders found</h3>
            <p>There are no orders with this status.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
