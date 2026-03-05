import express from 'express';
import { body, validationResult } from 'express-validator';
import Order from '../models/Order.model.js';
import Cart from '../models/Cart.model.js';
import Product from '../models/Product.model.js';
import { authenticate, isAdmin, isCustomer } from '../middleware/auth.middleware.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create order from cart
// @access  Private/Customer
router.post(
  '/',
  authenticate,
  isCustomer,
  [
    body('shippingAddress.name').notEmpty().withMessage('Name is required'),
    body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { shippingAddress } = req.body;

      // Get user's cart
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Validate stock and prepare order items
      const orderItems = [];
      let totalAmount = 0;

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product._id);
        if (!product || product.isDeleted) {
          return res.status(400).json({ message: `Product ${cartItem.product.name} is no longer available` });
        }

        if (product.stock < cartItem.quantity) {
          return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: cartItem.quantity,
          price: product.price,
        });

        totalAmount += product.price * cartItem.quantity;
      }

      // Create order
      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        totalAmount,
        shippingAddress,
        status: 'Pending',
        paymentStatus: 'Pending',
      });

      res.status(201).json({ message: 'Order created successfully', order });
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   GET /api/orders
// @desc    Get user's orders (Customer) or all orders (Admin)
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    let orders;
    if (req.user.role === 'admin') {
      orders = await Order.find()
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: req.user._id })
        .populate('items.product')
        .sort({ createdAt: -1 });
    }

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private/Admin
router.put(
  '/:id/status',
  authenticate,
  isAdmin,
  [body('status').isIn(['Pending', 'Paid', 'Ready for Pickup', 'Collected']).withMessage('Invalid status')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { status } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Only customer place-order flow can set Paid; admin cannot mark as Paid
      if (status === 'Paid') {
        return res.status(400).json({ message: 'Payment is set when the customer places the order. Use Ready for Pickup or Collected instead.' });
      }

      // Update stock when order is collected
      if (status === 'Collected' && order.status !== 'Collected') {
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock -= item.quantity;
            await product.save();
          }
        }
      }

      order.status = status;
      await order.save();

      res.json({ message: 'Order status updated', order });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

export default router;
