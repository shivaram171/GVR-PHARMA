// const mongoose = require('mongoose');

// const orderItemSchema = new mongoose.Schema({
//   medicine: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Medicine',
//     required: true
//   },
//   medicineName: { type: String },
//   quantity: {
//     type: Number,
//     required: true,
//     min: 1
//   },
//   unitPrice: {
//     type: Number,
//     required: true
//   },
//   totalPrice: {
//     type: Number,
//     required: true
//   }
// });

// const orderSchema = new mongoose.Schema({
//   orderNumber: {
//     type: String,
//     unique: true
//   },
//   supplier: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Supplier',
//     required: [true, 'Supplier is required']
//   },
//   items: [orderItemSchema],
//   status: {
//     type: String,
//     enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
//     default: 'Pending'
//   },
//   totalAmount: {
//     type: Number,
//     default: 0
//   },
//   orderDate: {
//     type: Date,
//     default: Date.now
//   },
//   expectedDeliveryDate: {
//     type: Date
//   },
//   deliveredDate: {
//     type: Date
//   },
//   paymentStatus: {
//     type: String,
//     enum: ['Unpaid', 'Partial', 'Paid'],
//     default: 'Unpaid'
//   },
//   notes: {
//     type: String,
//     default: ''
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, { timestamps: true });

// // Auto-generate order number before saving
// orderSchema.pre('save', async function (next) {
//   if (!this.orderNumber) {
//     const count = await mongoose.model('Order').countDocuments();
//     this.orderNumber = `GVR-ORD-${String(count + 1).padStart(5, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true,
  },
  medicineName: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: [true, 'Supplier is required'],
    },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    deliveredDate: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Partial', 'Paid'],
      default: 'Unpaid',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Auto-generate order number before saving
orderSchema.pre('save', async function (next) {
  try {
    if (!this.orderNumber) {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `GVR-ORD-${String(count + 1).padStart(5, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Order =
  mongoose.models.Order ||
  mongoose.model('Order', orderSchema);

module.exports = Order;