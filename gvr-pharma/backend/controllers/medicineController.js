const Medicine = require('../models/Medicine');

// @desc    Get all medicines
// @route   GET /api/medicines
exports.getMedicines = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { batchNumber: { $regex: req.query.search, $options: 'i' } },
        { genericName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.category) query.category = req.query.category;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';

    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .populate('supplier', 'name contactPerson phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: medicines.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: medicines
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
exports.getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('supplier');
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

// @desc    Create medicine
// @route   POST /api/medicines
exports.createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('supplier', 'name');

    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    res.json({ success: true, data: medicine });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });
    await medicine.deleteOne();
    res.json({ success: true, message: 'Medicine deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
exports.getLowStockMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      $expr: { $lte: ['$quantity', '$minStockLevel'] },
      isActive: true
    }).populate('supplier', 'name');
    res.json({ success: true, count: medicines.length, data: medicines });
  } catch (err) {
    next(err);
  }
};