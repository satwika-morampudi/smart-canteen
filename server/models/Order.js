const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  note: {
  type: String,
  default: ''
}
});

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Ready', 'Delivered'],
    default: 'Pending'
  },
  paymentMode: {
    type: String,
    enum: ['Online', 'Counter'],
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  tableNumber: {
    type: String,
    default: 'N/A'
  },
  estimatedTime: {
    type: Number,
    default: 10
  }
}, { timestamps: true });

// Auto-generate orderID before saving
orderSchema.pre('save', async function() {
  if (!this.orderID) {
    const timestamp = Date.now().toString().slice(-6);
    this.orderID = 'ORD' + timestamp;
  }
});

module.exports = mongoose.model('Order', orderSchema);