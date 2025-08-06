const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Stock = require('../models/Stock');

// @route   GET api/stock
// @desc    Get all stock items for a seller
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const stockItems = await Stock.find({ sellerId: req.user.id })
      .sort({ product: 1 }); // Sort alphabetically by product name
    res.json(stockItems);
  } catch (err) {
    console.error('Error fetching stock:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/stock/low
// @desc    Get all low stock items for a seller
// @access  Private
router.get('/low', auth, async (req, res) => {
  try {
    const lowStockItems = await Stock.find({
      sellerId: req.user.id,
      isLowStock: true
    }).sort({ quantity: 1 }); // Sort by lowest quantity first
    
    res.json(lowStockItems);
  } catch (err) {
    console.error('Error fetching low stock:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/stock/:id
// @desc    Get stock item by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id);
    
    // Check if stock item exists
    if (!stockItem) {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    
    // Check if stock item belongs to the logged in seller
    if (stockItem.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    res.json(stockItem);
  } catch (err) {
    console.error('Error fetching stock item:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/stock
// @desc    Create a new stock item
// @access  Private
router.post('/', auth, async (req, res) => {
  const {
    product,
    description,
    category,
    quantity,
    price,
    costPrice,
    sku,
    alertThreshold,
    imageUrl
  } = req.body;

  try {
    // Check if product already exists for this seller
    const existingProduct = await Stock.findOne({
      sellerId: req.user.id,
      product: product
    });

    if (existingProduct) {
      return res.status(400).json({ msg: 'Product already exists in your inventory' });
    }

    // Create new stock item
    const newStockItem = new Stock({
      sellerId: req.user.id,
      product,
      description,
      category,
      quantity,
      price,
      costPrice,
      sku,
      alertThreshold,
      imageUrl
    });

    // Save the stock item
    const stockItem = await newStockItem.save();

    res.json(stockItem);
  } catch (err) {
    console.error('Error creating stock item:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/stock/:id
// @desc    Update a stock item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const {
    product,
    description,
    category,
    quantity,
    price,
    costPrice,
    sku,
    alertThreshold,
    imageUrl
  } = req.body;

  try {
    let stockItem = await Stock.findById(req.params.id);
    
    // Check if stock item exists
    if (!stockItem) {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    
    // Check if stock item belongs to the logged in seller
    if (stockItem.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update fields
    if (product) stockItem.product = product;
    if (description !== undefined) stockItem.description = description;
    if (category) stockItem.category = category;
    if (quantity !== undefined) stockItem.quantity = quantity;
    if (price !== undefined) stockItem.price = price;
    if (costPrice !== undefined) stockItem.costPrice = costPrice;
    if (sku) stockItem.sku = sku;
    if (alertThreshold !== undefined) stockItem.alertThreshold = alertThreshold;
    if (imageUrl !== undefined) stockItem.imageUrl = imageUrl;
    
    // Save updated stock item
    await stockItem.save();
    
    res.json(stockItem);
  } catch (err) {
    console.error('Error updating stock item:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/stock/:id
// @desc    Delete a stock item
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const stockItem = await Stock.findById(req.params.id);
    
    // Check if stock item exists
    if (!stockItem) {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    
    // Check if stock item belongs to the logged in seller
    if (stockItem.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Delete the stock item
    await stockItem.remove();
    
    res.json({ msg: 'Stock item removed' });
  } catch (err) {
    console.error('Error deleting stock item:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/stock/:id/quantity
// @desc    Update stock quantity (for quick updates)
// @access  Private
router.put('/:id/quantity', auth, async (req, res) => {
  const { quantity, operation } = req.body;

  try {
    const stockItem = await Stock.findById(req.params.id);
    
    // Check if stock item exists
    if (!stockItem) {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    
    // Check if stock item belongs to the logged in seller
    if (stockItem.sellerId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    // Update quantity based on operation
    if (operation === 'add') {
      stockItem.quantity += Number(quantity);
    } else if (operation === 'subtract') {
      if (stockItem.quantity < quantity) {
        return res.status(400).json({ msg: 'Insufficient stock' });
      }
      stockItem.quantity -= Number(quantity);
    } else {
      // Direct set
      stockItem.quantity = Number(quantity);
    }
    
    // Save updated stock item
    await stockItem.save();
    
    res.json(stockItem);
  } catch (err) {
    console.error('Error updating stock quantity:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Stock item not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;