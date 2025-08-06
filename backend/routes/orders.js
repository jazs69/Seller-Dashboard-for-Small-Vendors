const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Order = require('../models/Order');
const Stock = require('../models/Stock');

// @route   GET api/orders
// @desc    Get all orders for a seller
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if order belongs to the logged in seller
    if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(order);
  } catch (err) {
    console.error('Error fetching order:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    customerName,
    customerEmail,
    product,
    quantity,
    price,
    shippingAddress,
    paymentMethod,
    notes
  } = req.body;

  try {
    // Check if product exists in stock
    const stockItem = await Stock.findOne({
      sellerId: req.user.id,
      product: product
    });

    if (!stockItem) {
      return res.status(400).json({ msg: 'Product not found in your inventory' });
    }

    if (stockItem.quantity < quantity) {
      return res.status(400).json({ msg: 'Insufficient stock' });
    }

    // Create new order
    const newOrder = new Order({
      sellerId: req.user.id,
      customerName,
      customerEmail,
      product,
      quantity,
      price,
      totalAmount: price * quantity,
      shippingAddress,
      paymentMethod,
      notes
    });

    // Save the order
    const order = await newOrder.save();

    // Update stock quantity
    stockItem.quantity -= quantity;
    await stockItem.save();

    res.json(order);
  } catch (err) {
    console.error('Error creating order:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/orders/:id
// @desc    Update order status
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { status, paymentStatus } = req.body;

  try {
    let order = await Order.findById(req.params.id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if order belongs to the logged in seller
    if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update fields
    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    
    // Save updated order
    await order.save();
    
    res.json(order);
  } catch (err) {
    console.error('Error updating order:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/orders/:id
// @desc    Delete an order
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if order belongs to the logged in seller
    if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // If order is not delivered or cancelled, return stock
    if (order.status !== 'Delivered' && order.status !== 'Cancelled') {
      const stockItem = await Stock.findOne({
        sellerId: order.sellerId,
        product: order.product
      });
      
      if (stockItem) {
        stockItem.quantity += order.quantity;
        await stockItem.save();
      }
    }
    
    // Delete the order
    await order.remove();
    
    res.json({ msg: 'Order removed' });
  } catch (err) {
    console.error('Error deleting order:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/orders/invoice/:id
// @desc    Generate invoice PDF for an order
// @access  Private
router.get('/invoice/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    // Check if order exists
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    
    // Check if order belongs to the logged in seller
    if (order.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${order._id}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(25).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Invoice Number: ${order._id}`, { align: 'right' });
    doc.fontSize(10).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();
    
    // Customer details
    doc.fontSize(12).text('Customer Details:');
    doc.fontSize(10).text(`Name: ${order.customerName}`);
    doc.fontSize(10).text(`Email: ${order.customerEmail}`);
    
    if (order.shippingAddress) {
      doc.fontSize(10).text('Shipping Address:');
      const address = order.shippingAddress;
      doc.fontSize(10).text(`${address.street || ''}, ${address.city || ''}, ${address.state || ''}, ${address.zipCode || ''}, ${address.country || ''}`);
    }
    
    doc.moveDown();
    
    // Order details
    doc.fontSize(12).text('Order Details:');
    doc.moveDown();
    
    // Table header
    const tableTop = doc.y;
    doc.fontSize(10);
    doc.text('Product', 50, tableTop);
    doc.text('Quantity', 200, tableTop);
    doc.text('Price', 300, tableTop);
    doc.text('Total', 400, tableTop);
    
    // Table content
    const itemY = tableTop + 20;
    doc.text(order.product, 50, itemY);
    doc.text(order.quantity.toString(), 200, itemY);
    doc.text(`$${order.price.toFixed(2)}`, 300, itemY);
    doc.text(`$${order.totalAmount.toFixed(2)}`, 400, itemY);
    
    // Draw line
    doc.moveDown(2);
    doc.lineCap('butt')
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    
    doc.moveDown();
    
    // Total
    doc.fontSize(12).text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: 'right' });
    
    // Payment info
    doc.moveDown();
    doc.fontSize(10).text(`Payment Method: ${order.paymentMethod}`);
    doc.fontSize(10).text(`Payment Status: ${order.paymentStatus}`);
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
    
    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error('Error generating invoice:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;