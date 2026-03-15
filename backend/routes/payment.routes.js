import express from 'express';
import crypto from 'crypto';
import path from 'path';
import Razorpay from 'razorpay';
import Order from '../models/Order.model.js';
import Payment from '../models/Payment.model.js';
import Cart from '../models/Cart.model.js';
import { authenticate, isCustomer } from '../middleware/auth.middleware.js';
import { generateInvoice } from '../utils/invoiceGenerator.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

// Initialize Razorpay (lazy-loaded to ensure env variables are set)
let razorpay = null;

const initializeRazorpay = () => {
  if (razorpay) return razorpay;
  
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    try {
      razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });
      console.log('✅ Razorpay initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Razorpay:', error.message);
      razorpay = null;
    }
  }
  return razorpay;
};

// @route   POST /api/payments/create-order
// @desc    Create Razorpay order
// @access  Private/Customer
router.post('/create-order', authenticate, isCustomer, async (req, res) => {
  try {
    const rpInstance = initializeRazorpay();
    if (!rpInstance) {
      return res.status(503).json({ message: 'Payment service is not configured. Please set Razorpay credentials in environment variables.' });
    }

    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Create Razorpay order
    const razorpayOrder = await rpInstance.orders.create({
      amount: Math.round(order.totalAmount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${order._id}`,
    });

    // Save Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify payment and update order
// @access  Private/Customer
router.post('/verify', authenticate, isCustomer, async (req, res) => {
  try {
    const rpInstance = initializeRazorpay();
    if (!rpInstance || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ message: 'Payment service is not configured. Please set Razorpay credentials in environment variables.' });
    }

    const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Verify signature
    const text = `${order.razorpayOrderId}|${razorpayPaymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Create payment record
    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      status: 'Completed',
    });

    // Update order
    order.paymentStatus = 'Paid';
    order.status = 'Paid';
    order.paymentId = payment._id;
    await order.save();

    // Generate invoice
    const invoicePath = await generateInvoice(order, req.user);
    order.invoiceUrl = `/invoices/${path.basename(invoicePath)}`;
    await order.save();

    // Send order confirmation email with invoice
    try {
      await sendOrderConfirmationEmail(req.user.email, req.user.name, order, req.user, invoicePath);
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr);
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.json({
      message: 'Payment successful',
      payment,
      order,
      invoiceUrl: order.invoiceUrl,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payments/demo-complete
// @desc    Mark order as paid (no Razorpay). Generate invoice, send order confirmation email, clear cart.
// @access  Private/Customer
router.post('/demo-complete', authenticate, isCustomer, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    order.paymentStatus = 'Paid';
    order.status = 'Paid';
    order.paymentId = 'demo';
    await order.save();

    const invoicePath = await generateInvoice(order, req.user);
    order.invoiceUrl = `/invoices/${path.basename(invoicePath)}`;
    await order.save();

    try {
      await sendOrderConfirmationEmail(req.user.email, req.user.name, order, req.user, invoicePath);
    } catch (emailErr) {
      console.error('[Payment] Order confirmation email failed:', emailErr.message);
      if (emailErr.response) console.error('[Payment] SMTP response:', emailErr.response);
      if (emailErr.code) console.error('[Payment] Error code:', emailErr.code);
      // Order still succeeds; email failure is logged
    }

    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    res.json({
      message: 'Payment successful',
      order,
      invoiceUrl: order.invoiceUrl,
    });
  } catch (error) {
    console.error('Demo payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
