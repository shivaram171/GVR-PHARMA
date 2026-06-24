const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');

// @desc    Inventory Report
exports.inventoryReport = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ isActive: true }).populate('supplier', 'name');
    const totalValue = medicines.reduce((acc, m) => acc + (m.quantity * m.price), 0);
    const totalMedicines = medicines.length;
    const lowStock = medicines.filter(m => m.quantity <= m.minStockLevel).length;

    const byCategory = medicines.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalMedicines,
        totalValue,
        lowStock,
        byCategory,
        medicines
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Sales/Orders Report
exports.salesReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};
    if (startDate && endDate) {
      dateQuery = { createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    const orders = await Order.find({ ...dateQuery, status: { $ne: 'Cancelled' } })
      .populate('supplier', 'name');

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;

    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly data for chart
    const monthlyData = {};
    orders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) monthlyData[month] = { orders: 0, revenue: 0 };
      monthlyData[month].orders += 1;
      monthlyData[month].revenue += order.totalAmount;
    });

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        deliveredOrders,
        byStatus,
        monthlyData,
        orders
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Low stock report
exports.lowStockReport = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true
    }).populate('supplier', 'name phone');

    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (err) {
    next(err);
  }
};