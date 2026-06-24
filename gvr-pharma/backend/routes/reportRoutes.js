const express = require('express');
const router = express.Router();
const { inventoryReport, salesReport, lowStockReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/inventory', protect, inventoryReport);
router.get('/sales', protect, salesReport);
router.get('/low-stock', protect, lowStockReport);

module.exports = router;