import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.product);
      if (response.data.product.images?.length > 0) {
        setSelectedImage(0);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to continue');
      navigate('/login', { state: { from: 'cart' } });
      return;
    }

    const result = await addToCart(product._id, quantity);
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl mx-auto">

        {/* Left Column: Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-white p-8 flex items-center justify-center shadow-lg border border-border/60 group">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImage].url}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="text-textMuted flex flex-col items-center">
                <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>No Image Available</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-white p-2 border-2 transition-all duration-300 ${selectedImage === index
                    ? 'border-primary-500 ring-2 ring-primary-500/30'
                    : 'border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Right Column: Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full lg:sticky lg:top-24"
        >
          {/* Breadcrumbs / Category */}
          <div className="flex items-center gap-2 text-sm text-primary-400 mb-4 font-medium uppercase tracking-wider">
            <span>{product.category}</span>
            {product.brand && (
              <>
                <span className="w-1 h-1 rounded-full bg-textMuted" />
                <span>{product.brand}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary mb-6 leading-tight">
            {product.name}
          </h1>

          <div className="flex flex-wrap items-end gap-4 mb-8 pb-8 border-b border-border/60">
            <span className="text-3xl md:text-4xl font-bold text-primary-600">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.stock > 0 ? (
              <span className="bg-success/10 text-success border border-success/20 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                {product.stock} in stock
              </span>
            ) : (
              <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                Out of stock
              </span>
            )}
          </div>

          <div className="max-w-none mb-10 text-textSecondary leading-relaxed text-lg">
            {product.description}
          </div>

          <div className="mt-auto space-y-8 bg-bgSecondary/70 rounded-2xl p-6 md:p-8 backdrop-blur-sm border border-border/60">
            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <span className="text-lg font-medium text-textSecondary">Quantity</span>
                <div className="flex items-center bg-card rounded-lg border border-border/60 p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:text-primary-400 transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1));
                      setQuantity(val);
                    }}
                    className="w-14 text-center bg-transparent border-none focus:ring-0 font-bold text-lg"
                    min="1"
                    max={product.stock}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-xl hover:text-primary-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 btn-primary py-4 text-lg shadow-lg hover:shadow-primary-500/25 ${product.stock === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''
                  }`}
              >
                {product.stock > 0 ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </span>
                ) : 'Sold Out'}
              </button>
              {/* Optional: Add to Wishlist or similar secondary action could go here */}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;
