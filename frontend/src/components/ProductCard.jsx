import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`} className="block h-full">
      <motion.div
        whileHover={{ y: -8 }}
        className="card h-full flex flex-col p-4 relative overflow-hidden group border border-border/40 bg-gradient-to-br from-bgSecondary/60 to-card"
      >
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl" />

        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-5 bg-white p-4 flex items-center justify-center shadow-inner">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply filter group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Stock Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {product.stock === 0 ? (
              <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm shadow-sm">
                Out of Stock
              </span>
            ) : product.stock < 5 ? (
              <span className="bg-orange-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm shadow-sm">
                Low Stock
              </span>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative z-10">
          <div className="mb-1">
            <h3 className="text-lg font-bold text-textPrimary leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors duration-300">
              {product.name}
            </h3>
          </div>

          <div className="mt-2 mb-4">
            <p className="text-textSecondary text-sm line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Footer: Price */}
          <div className="mt-auto pt-3 border-t border-border/60 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-textMuted font-medium uppercase tracking-wider mb-0.5">Price</span>
              <span className="text-2xl font-extrabold text-primary-600">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>

            {product.stock > 0 && (
              <span className="text-xs text-success font-semibold bg-success/10 px-2 py-1 rounded-full border border-success/20">
                In Stock
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
