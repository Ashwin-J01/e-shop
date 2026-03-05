import express from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.model.js';
import { authenticate, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, available, brand, sort } = req.query;
    const query = { isDeleted: false };

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (search) {
      // Use regex search instead of text search (more reliable without index)
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (available === 'true') {
      query.stock = { $gt: 0 };
    }

    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'price-low') {
      sortOption = { price: 1 }; // Low to high
    } else if (sort === 'price-high') {
      sortOption = { price: -1 }; // High to low
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .select('-isDeleted');

    res.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isDeleted: false });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/brands
// @desc    Get all brands
// @access  Public
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isDeleted: false, brand: { $ne: null, $ne: '' } });
    res.json({ brands });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create product (Admin only)
// @access  Private/Admin
router.post(
  '/',
  authenticate,
  isAdmin,
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .toFloat()
      .isFloat({ min: 0 }).withMessage('Valid price (number >= 0) is required'),
    body('stock')
      .notEmpty().withMessage('Stock is required')
      .toInt()
      .isInt({ min: 0 }).withMessage('Valid stock (integer >= 0) is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        console.log('Request body:', req.body);
        return res.status(400).json({ 
          message: 'Validation failed. Please check all required fields.',
          errors: errors.array() 
        });
      }

      const { name, description, category, price, stock, brand, specifications, images } = req.body;

      // Process images (expecting array of image URLs)
      const productImages = [];
      if (images && Array.isArray(images)) {
        productImages.push(...images.map(url => ({ url, publicId: '' })));
      } else if (images && typeof images === 'string') {
        // Single image URL
        productImages.push({ url: images, publicId: '' });
      }

      const product = await Product.create({
        name,
        description,
        category,
        price: Number(price),
        stock: Number(stock),
        images: productImages,
        brand,
        specifications: specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : undefined,
      });

      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ 
        message: 'Server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put(
  '/:id',
  authenticate,
  isAdmin,
  [
    body('name').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const product = await Product.findById(req.params.id);
      if (!product || product.isDeleted) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const { name, description, category, price, stock, brand, specifications, images } = req.body;

      // Update fields
      if (name) product.name = name;
      if (description) product.description = description;
      if (category) product.category = category;
      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (brand) product.brand = brand;
      if (specifications) {
        product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
      }

      // Update images if provided
      if (images !== undefined) {
        if (Array.isArray(images)) {
          product.images = images.map(url => ({ url, publicId: '' }));
        } else if (typeof images === 'string') {
          product.images = [{ url: images, publicId: '' }];
        }
      }

      await product.save();

      res.json({ message: 'Product updated successfully', product });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Soft delete product (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isDeleted = true;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id/image/:imageId
// @desc    Delete product image (Admin only)
// @access  Private/Admin
router.delete('/:id/image/:imageId', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.isDeleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const image = product.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Remove from array (no cloud storage to delete from)
    product.images.pull(req.params.imageId);
    await product.save();

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
