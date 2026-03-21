const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchID: {
    type: String
  },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  status: {
    type: String,
    enum: ['In Progress', 'Completed'],
    default: 'In Progress'
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

batchSchema.pre('save', async function() {
  if (!this.batchID) {
    const timestamp = Date.now().toString().slice(-6);
    this.batchID = 'BAT' + timestamp;
  }
});

module.exports = mongoose.model('Batch', batchSchema);