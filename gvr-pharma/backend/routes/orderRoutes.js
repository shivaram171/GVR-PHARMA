const express = require('express');
const router = express.Router();
const {
  getOrders, getOrder, createOrder, updateOrder, deleteOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router.route('/:id')
  .get(protect, getOrder)
  .put(protect, authorize('admin', 'manager'), updateOrder)
  .delete(protect, authorize('admin'), deleteOrder);

module.exports = router;