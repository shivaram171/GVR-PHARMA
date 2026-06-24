const Medicine = require('../models/Medicine');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalMedicines = await Medicine.countDocuments({ isActive: true });
    const totalSuppliers = await Supplier.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const totalUsers = await User.countDocuments();

    const lowStockMedicines = await Medicine.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true
    }).select('name quantity minStockLevel').limit(5);

    const medicines = await Medicine.find({ isActive: true });
    const totalInventoryValue = medicines.reduce((acc, m) => acc + (m.quantity * m.price), 0);

    const expiringMedicines = await Medicine.find({
      expiryDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      isActive: true
    }).select('name expiryDate batchNumber quantity').limit(5);

    const recentOrders = await Order.find()
      .populate('supplier', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly orders for chart (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const startOfMonth = new Date(year, date.getMonth(), 1);
      const endOfMonth = new Date(year, date.getMonth() + 1, 0);

      const count = await Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const revenue = await Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth, $lte: endOfMonth }, status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);

      last6Months.push({
        month: `${month} ${year}`,
        orders: count,
        revenue: revenue[0]?.total || 0
      });
    }

    // Category distribution
    const categoryDist = await Medicine.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 }, value: { $sum: { $multiply: ['$quantity', '$price'] } } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalMedicines,
          totalSuppliers,
          totalOrders,
          pendingOrders,
          totalUsers,
          totalInventoryValue
        },
        lowStockMedicines,
        expiringMedicines,
        recentOrders,
        chartData: {
          monthlyOrders: last6Months,
          categoryDistribution: categoryDist
        }
      }
    });
  } catch (err) {
    next(err);
  }
};