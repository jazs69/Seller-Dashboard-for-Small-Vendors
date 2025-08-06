const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'Uncategorized'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  alertThreshold: {
    type: Number,
    default: 5,
    min: 0
  },
  isLowStock: {
    type: Boolean,
    default: false
  },
  imageUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field and check for low stock before saving
StockSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.isLowStock = this.quantity <= this.alertThreshold;
  next();
});

module.exports = mongoose.model('Stock', StockSchema);