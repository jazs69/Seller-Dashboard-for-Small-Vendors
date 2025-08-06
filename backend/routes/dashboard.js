const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Stock = require('../models/Stock');

// @route   GET api/dashboard/summary
// @desc    Get dashboard summary data
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));
    
    // Calculate start of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Calculate start of previous month
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
    
    // Get total orders count
    const totalOrders = await Order.countDocuments({ sellerId: req.user.id });
    
    // Get today's orders
    const todayOrders = await Order.countDocuments({
      sellerId: req.user.id,
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    
    // Get pending orders
    const pendingOrders = await Order.countDocuments({
      sellerId: req.user.id,
      status: 'Pending'
    });
    
    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { sellerId: req.user.id } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    
    // Get current month revenue
    const monthRevenueResult = await Order.aggregate([
      {
        $match: {
          sellerId: req.user.id,
          createdAt: { $gte: startOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthRevenue = monthRevenueResult.length > 0 ? monthRevenueResult[0].total : 0;
    
    // Get previous month revenue
    const prevMonthRevenueResult = await Order.aggregate([
      {
        $match: {
          sellerId: req.user.id,
          createdAt: { $gte: startOfPrevMonth, $lte: endOfPrevMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const prevMonthRevenue = prevMonthRevenueResult.length > 0 ? prevMonthRevenueResult[0].total : 0;
    
    // Calculate revenue growth percentage
    let revenueGrowth = 0;
    if (prevMonthRevenue > 0) {
      revenueGrowth = ((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    }
    
    // Get low stock items count
    const lowStockCount = await Stock.countDocuments({
      sellerId: req.user.id,
      isLowStock: true
    });
    
    // Get total inventory value
    const inventoryValueResult = await Stock.aggregate([
      { $match: { sellerId: req.user.id } },
      { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);
    const inventoryValue = inventoryValueResult.length > 0 ? inventoryValueResult[0].total : 0;
    
    // Get recent orders
    const recentOrders = await Order.find({ sellerId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get top selling products
    const topProducts = await Order.aggregate([
      { $match: { sellerId: req.user.id } },
      { $group: {
          _id: '$product',
          totalSold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);
    
    // Return dashboard data
    res.json({
      totalOrders,
      todayOrders,
      pendingOrders,
      totalRevenue,
      monthRevenue,
      prevMonthRevenue,
      revenueGrowth,
      lowStockCount,
      inventoryValue,
      recentOrders,
      topProducts
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/dashboard/sales-chart
// @desc    Get sales data for charts
// @access  Private
router.get('/sales-chart', auth, async (req, res) => {
  try {
    const { period } = req.query;
    const today = new Date();
    let startDate, endDate;
    let groupBy;
    
    // Set date range based on period
    switch (period) {
      case 'week':
        // Last 7 days
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.setHours(23, 59, 59, 999));
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'month':
        // Current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'year':
        // Current year
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        // Default to last 30 days
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(today.setHours(23, 59, 59, 999));
        groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    }
    
    // Get sales data grouped by date
    const salesData = await Order.aggregate([
      {
        $match: {
          sellerId: req.user.id,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          units: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(salesData);
  } catch (err) {
    console.error('Error fetching sales chart data:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/dashboard/inventory-status
// @desc    Get inventory status data
// @access  Private
router.get('/inventory-status', auth, async (req, res) => {
  try {
    // Get inventory by category
    const inventoryByCategory = await Stock.aggregate([
      { $match: { sellerId: req.user.id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$quantity', '$price'] } },
          totalItems: { $sum: '$quantity' }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);
    
    // Get low stock items
    const lowStockItems = await Stock.find({
      sellerId: req.user.id,
      isLowStock: true
    }).sort({ quantity: 1 }).limit(10);
    
    res.json({
      inventoryByCategory,
      lowStockItems
    });
  } catch (err) {
    console.error('Error fetching inventory status:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;