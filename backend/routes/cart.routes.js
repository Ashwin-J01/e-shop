import express from 'express';
import { body, validationResult } from 'express-validator';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { authenticate, isCustomer } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private/Customer
router.get('/', authenticate, isCustomer, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out deleted products
    cart.items = cart.items.filter((item) => item.product && !item.product.isDeleted);

    const total = cart.calculateTotal();

    res.json({ cart, total });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private/Customer
router.post(
  '/',
  authenticate,
  isCustomer,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { productId, quantity } = req.body;

      // Find product
      const product = await Product.findOne({ _id: productId, isDeleted: false });
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      // Find or create cart
      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingItemIndex > -1) {
        // Update quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (product.stock < newQuantity) {
          return res.status(400).json({ message: 'Insufficient stock' });
        }
        cart.items[existingItemIndex].quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          product: productId,
          quantity,
          price: product.price,
        });
      }

      await cart.save();
      await cart.populate('items.product');

      const total = cart.calculateTotal();

      res.json({ message: 'Item added to cart', cart, total });
    } catch (error) {
      console.error('Add to cart error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Private/Customer
router.put(
  '/:itemId',
  authenticate,
  isCustomer,
  [body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { quantity } = req.body;
      const cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        return res.status(404).json({ message: 'Cart not found' });
      }

      const item = cart.items.id(req.params.itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found in cart' });
      }

      // Check stock
      const product = await Product.findById(item.product);
      if (!product || product.isDeleted) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      item.quantity = quantity;
      await cart.save();
      await cart.populate('items.product');

      const total = cart.calculateTotal();

      res.json({ message: 'Cart updated', cart, total });
    } catch (error) {
      console.error('Update cart error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Private/Customer
router.delete('/:itemId', authenticate, isCustomer, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product');

    const total = cart.calculateTotal();

    res.json({ message: 'Item removed from cart', cart, total });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear cart
// @access  Private/Customer
router.delete('/', authenticate, isCustomer, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
