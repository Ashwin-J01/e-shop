import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [highlyPickedProducts, setHighlyPickedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalProducts: 0, totalCategories: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('/api/products?available=true');
      const products = response.data.products || [];

      // Get highly picked products (products with images, sorted by newest, limit 8)
      const productsWithImages = products
        .filter(p => p.images && p.images.length > 0 && p.stock > 0)
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 8);
      setHighlyPickedProducts(productsWithImages);

      // Get unique categories
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories.slice(0, 6));

      // Get unique brands
      const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
      setBrands(uniqueBrands.slice(0, 8));

      // Set stats
      setStats({
        totalProducts: products.length,
        totalCategories: uniqueCategories.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: '⚡',
      title: 'Quality Products',
      description: 'Premium electrical and hardware items from trusted brands'
    },
    {
      icon: '🛒',
      title: 'Easy Ordering',
      description: 'Browse, add to cart, and order online with just a few clicks'
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Safe and secure online payment options available'
    },
    {
      icon: '📦',
      title: 'In-Store Pickup',
      description: 'Order online and collect from our store at your convenience'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Banner Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(34,211,238,0.08))]"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-6xl md:text-8xl font-extrabold mb-6 bg-gradient-to-r from-primary-300 via-primary-400 to-primary-500 bg-clip-text text-transparent leading-tight drop-shadow-2xl"
            >
              JK Electricals & Hardwares
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl md:text-3xl text-textPrimary/90 mb-10 max-w-3xl mx-auto leading-relaxed font-light"
            >
              Your trusted partner for all electrical and hardware needs
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link
                to="/products"
                className="bg-primary-gradient text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-neon/20 transform hover:-translate-y-1 min-w-[220px] text-center"
              >
                Shop Now
              </Link>
              <Link
                to="/products"
                className="bg-bgSecondary/80 backdrop-blur-md border-2 border-border hover:border-primary-500/50 text-textPrimary font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 hover:bg-card/70 min-w-[220px] text-center"
              >
                Browse Categories
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 -mt-12 relative z-20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6 text-center bg-[linear-gradient(135deg,rgba(59,130,246,0.22),rgba(34,211,238,0.10))] border-2 border-primary-500/25 hover:border-neon/35 transition-all duration-300 hover:scale-105"
          >
            <div className="text-5xl font-extrabold text-primary-600 mb-3">{stats.totalProducts}+</div>
            <div className="text-textSecondary text-lg font-medium">Products Available</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-dark rounded-2xl p-6 text-center bg-bgSecondary/40 border-2 border-border/70 hover:border-info/40 transition-all duration-300 hover:scale-105"
          >
            <div className="text-5xl font-extrabold text-info mb-3">{stats.totalCategories}+</div>
            <div className="text-textSecondary text-lg font-medium">Categories</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-2xl p-6 text-center bg-bgSecondary/40 border-2 border-border/70 hover:border-success/40 transition-all duration-300 hover:scale-105"
          >
            <div className="text-5xl font-extrabold text-success mb-3">100%</div>
            <div className="text-textSecondary text-lg font-medium">Quality Assured</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent"
        >
          Why Choose Us?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-textSecondary text-lg mb-12"
        >
          Experience excellence in every aspect
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="glass-dark rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-primary-500/30 group"
            >
              <div className="text-6xl mb-5 transform group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3 text-textPrimary group-hover:text-primary-400 transition-colors">{feature.title}</h3>
              <p className="text-textSecondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="container mx-auto px-4 py-20 bg-[linear-gradient(180deg,rgba(241,245,249,0.85),rgba(248,250,252,1))]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Shop by Category
            </h2>
            <p className="text-textSecondary text-lg">Browse our wide range of product categories</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-7xl mx-auto">
            {categories.map((category, index) => {
              const getCategoryIcon = (catName) => {
                const name = catName.toLowerCase();
                // Lighting / LED
                if (name.includes('light') || name.includes('led') || name.includes('bulb') || name.includes('lamp')) {
                  return "💡";
                }
                // Wiring / Cables
                if (name.includes('wire') || name.includes('cable') || name.includes('cord')) {
                  return "🔌";
                }
                // Switches / Sockets
                if (name.includes('switch') || name.includes('socket') || name.includes('plug')) {
                  return "⚡";
                }
                // Fans
                if (name.includes('fan') || name.includes('air') || name.includes('cool')) {
                  return "❄️";
                }
                // Tools
                if (name.includes('tool') || name.includes('drill') || name.includes('hammer') || name.includes('screw')) {
                  return "🔧";
                }
                // Pipes / Plumbing
                if (name.includes('pipe') || name.includes('pvc') || name.includes('plumb') || name.includes('fitting')) {
                  return "🚰";
                }
                // Hardware / General
                if (name.includes('bolt') || name.includes('nut') || name.includes('nail') || name.includes('iron')) {
                  return "🔩";
                }
                // Electronics
                if (name.includes('circuit') || name.includes('board') || name.includes('mcb')) {
                  return "🔋";
                }
                // Paint
                if (name.includes('paint') || name.includes('color')) {
                  return "🎨";
                }
                // Safety
                if (name.includes('safety') || name.includes('helmet') || name.includes('glove')) {
                  return "⛑️";
                }

                return "📦"; // Default
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <Link
                    to={`/products?category=${encodeURIComponent(category)}`}
                    className="glass-dark rounded-xl p-6 text-center hover:scale-110 transition-all duration-300 block border-2 border-transparent hover:border-primary-500/40 group"
                  >
                    <div className="text-4xl mb-3 transform group-hover:scale-125 transition-transform duration-300">
                      {getCategoryIcon(category)}
                    </div>
                    <div className="font-semibold text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">{category}</div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link
              to="/products"
              className="inline-block bg-primary-gradient text-white font-bold px-8 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-neon/15 transform hover:-translate-y-1"
            >
              View All Categories
            </Link>
          </motion.div>
        </section>
      )}

      {/* Featured Brands Section */}
      {brands.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              Featured Brands
            </h2>
            <p className="text-textSecondary text-lg">Trusted brands we work with</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-7xl mx-auto">
            {brands.map((brand, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, rotateY: -90 }}
                whileInView={{ opacity: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  to={`/products?brand=${encodeURIComponent(brand)}`}
                  className="glass-dark rounded-xl p-6 text-center hover:scale-110 transition-all duration-300 border-2 border-transparent hover:border-primary-500/40 group cursor-pointer block"
                >
                  <div className="text-3xl mb-2 transform group-hover:scale-125 transition-transform duration-300">🏷️</div>
                  <div className="font-semibold text-xs line-clamp-2 group-hover:text-primary-400 transition-colors">{brand}</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Highly Picked Products */}
      <section className="container mx-auto px-4 py-20 bg-[linear-gradient(180deg,rgba(241,245,249,0.75),rgba(248,250,252,1))]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Highly Picked Products
          </h2>
          <p className="text-textSecondary text-lg">Most popular products chosen by our customers</p>
        </motion.div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {highlyPickedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
        {!loading && highlyPickedProducts.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-textSecondary text-xl py-12"
          >
            No products available at the moment. Check back soon!
          </motion.p>
        )}
        {!loading && highlyPickedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-block bg-primary-gradient text-white font-bold text-lg px-10 py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-neon/20 transform hover:-translate-y-1"
            >
              Explore More Products
            </Link>
          </motion.div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-dark rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.08))] border-2 border-primary-500/25"
        >
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
            Ready to Shop?
          </h2>
          <p className="text-xl text-textSecondary mb-10 leading-relaxed">
            Browse our extensive collection of electrical and hardware products
          </p>
          <Link
            to="/products"
            className="inline-block bg-primary-gradient text-white font-bold text-xl px-12 py-5 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-neon/20 transform hover:-translate-y-1"
          >
            Start Shopping
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
