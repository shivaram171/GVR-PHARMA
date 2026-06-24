const express = require('express');
const router = express.Router();
const {
  getMedicines, getMedicine, createMedicine, updateMedicine, deleteMedicine, getLowStockMedicines
} = require('../controllers/medicineController');
const { protect, authorize } = require('../middleware/auth');

router.get('/low-stock', protect, getLowStockMedicines);
router.route('/').get(protect, getMedicines).post(protect, authorize('admin', 'manager'), createMedicine);
router.route('/:id')
  .get(protect, getMedicine)
  .put(protect, authorize('admin', 'manager'), updateMedicine)
  .delete(protect, authorize('admin'), deleteMedicine);

module.exports = router;