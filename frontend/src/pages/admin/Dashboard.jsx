import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/orders'),
      ]);

      const products = productsRes.data.products;
      const orders = ordersRes.data.orders;

      const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Paid').length;
      const completedOrders = orders.filter((o) => o.status === 'Collected').length;
      const revenue = orders
        .filter((o) => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        revenue,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      className: 'bg-[linear-gradient(135deg,rgba(59,130,246,0.24),rgba(34,211,238,0.10))] border border-primary-500/20',
      link: '/admin/products'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      className: 'bg-bgSecondary/40 border border-border/70 hover:border-primary-500/25',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      className: 'bg-warning/10 border border-warning/20',
      link: '/admin/orders'
    },
    {
      title: 'Completed Orders',
      value: stats.completedOrders,
      className: 'bg-success/10 border border-success/20',
      link: '/admin/orders'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.revenue.toFixed(2)}`,
      className: 'bg-[linear-gradient(135deg,rgba(59,130,246,0.20),rgba(34,211,238,0.10))] border border-neon/20',
      link: '/admin/orders'
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card ${stat.className} cursor-pointer hover:scale-105 transition-transform`}
            >
              <h3 className="text-textSecondary text-sm mb-2">{stat.title}</h3>
              <p className="text-3xl font-bold text-textPrimary">{stat.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Link to="/admin/products">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card hover:scale-105 transition-transform cursor-pointer"
          >
            <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
            <p className="text-textSecondary">Add, edit, or delete products</p>
          </motion.div>
        </Link>
        <Link to="/admin/orders">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card hover:scale-105 transition-transform cursor-pointer"
          >
            <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
            <p className="text-textSecondary">View and update order status</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
