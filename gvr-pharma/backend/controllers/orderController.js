const Order = require('../models/Order');
const Medicine = require('../models/Medicine');

// @desc    Get all orders
// @route   GET /api/orders
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.search) {
      query.orderNumber = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('supplier', 'name contactPerson phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('supplier')
      .populate('items.medicine', 'name batchNumber')
      .populate('createdBy', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { supplier, items, expectedDeliveryDate, notes, paymentStatus } = req.body;

    let totalAmount = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ success: false, message: `Medicine ${item.medicine} not found` });
      }
      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;
      processedItems.push({
        medicine: item.medicine,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice
      });
    }

    const order = await Order.create({
      supplier,
      items: processedItems,
      totalAmount,
      expectedDeliveryDate,
      notes,
      paymentStatus,
      createdBy: req.user._id
    });

    const populated = await Order.findById(order._id)
      .populate('supplier', 'name')
      .populate('createdBy', 'name');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('supplier', 'name').populate('createdBy', 'name');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // If delivered, update medicine quantity
    if (req.body.status === 'Delivered') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicine, {
          $inc: { quantity: item.quantity }
        });
      }
      order.deliveredDate = new Date();
      await order.save();
    }

    res.json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
};