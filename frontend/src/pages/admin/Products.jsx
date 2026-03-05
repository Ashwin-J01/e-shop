import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, Plus, Filter, Edit, Trash2, Package, X, Image as ImageIcon } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    brand: '',
    images: [''],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUrlChange = (e, index) => {
    const newImages = [...formData.images];
    newImages[index] = e.target.value;
    setFormData({ ...formData, images: newImages });
  };

  const addImageUrl = () => {
    setFormData({ ...formData, images: [...formData.images, ''] });
  };

  const removeImageUrl = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name || !formData.description || !formData.category || !formData.price || !formData.stock) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseFloat(formData.price) < 0 || parseInt(formData.stock) < 0) {
      toast.error('Price and stock must be 0 or greater');
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: formData.price.toString(),
        stock: formData.stock.toString(),
        brand: formData.brand.trim() || undefined,
        images: formData.images.filter(url => url.trim() !== ''),
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData);
        toast.success('Product updated successfully');
      } else {
        await axios.post('/api/products', productData);
        toast.success('Product created successfully');
      }

      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', category: '', price: '', stock: '', brand: '', images: [''] });
      fetchProducts();
    } catch (error) {
      console.error('Product operation error:', error);

      // Handle validation errors
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message).join(', ');
        toast.error(`Validation error: ${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || error.message || 'Operation failed');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      brand: product.brand || '',
      images: product.images && product.images.length > 0
        ? product.images.map(img => img.url)
        : [''],
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['All', ...new Set(products.map(p => p.category))];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-bgSecondary/20 p-4 rounded-2xl border border-border/50">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field pl-10 py-2.5 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-textSecondary h-4 w-4" />
            <select
              className="input-field pl-10 py-2.5 w-full appearance-none cursor-pointer"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <span className="text-textSecondary text-xs">▼</span>
            </div>
          </div>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2.5 px-6">
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-bgSecondary/20 rounded-2xl border border-border/50 overflow-hidden shadow-xl backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bgSecondary/40 border-b border-border/50 text-textSecondary text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-bgSecondary/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-bgSecondary overflow-hidden shrink-0 border border-border/50">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-textSecondary">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-textPrimary group-hover:text-primary-400 transition-colors">{product.name}</h3>
                          <p className="text-sm text-textSecondary">{product.brand || 'No Brand'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-500/10 text-primary-400 border border-primary-500/20">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-textPrimary">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-error'}`} />
                        <span className={`${product.stock === 0 ? 'text-error' : 'text-textSecondary'}`}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-primary-500/20 text-textSecondary hover:text-primary-400 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 hover:bg-error/20 text-textSecondary hover:text-error rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center text-textSecondary">
            <Package size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p>Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark rounded-2xl p-0 max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-border/60"
          >
            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-bgSecondary/30">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editingProduct ? <Edit size={24} className="text-primary-400" /> : <Plus size={24} className="text-primary-400" />}
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-textSecondary hover:text-textPrimary transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-8 custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-2">Product Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Wireless Headphones"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-2">Brand</label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Sony"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-2">Price (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary">₹</span>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="input-field pl-8"
                            step="0.01"
                            min="0"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-2">Stock</label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleInputChange}
                          className="input-field"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-2">Category</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="e.g., Electronics"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-2">Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="input-field min-h-[120px]"
                        placeholder="Product details..."
                        rows="4"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-2">Images</label>
                      <div className="space-y-3 bg-bgSecondary/30 p-4 rounded-xl border border-border/30">
                        {formData.images.map((url, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary w-4 h-4" />
                                <input
                                  type="url"
                                  value={url}
                                  onChange={(e) => handleImageUrlChange(e, index)}
                                  placeholder="https://example.com/image.jpg"
                                  className="input-field pl-9 text-sm py-2"
                                />
                              </div>
                            </div>
                            {formData.images.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeImageUrl(index)}
                                className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors border border-transparent hover:border-error/20"
                                title="Remove Image"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addImageUrl}
                          className="w-full py-2 bg-bgSecondary/50 hover:bg-bgSecondary text-textSecondary hover:text-textPrimary rounded-lg text-sm transition-colors border-2 border-dashed border-border hover:border-primary-500/50 flex items-center justify-center gap-2"
                        >
                          <Plus size={16} /> Add Image Link
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border/50 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary px-6"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary px-8">
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
