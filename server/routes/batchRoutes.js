const express = require('express');
const router = express.Router();
const Batch = require('../models/Batch');
const Order = require('../models/Order');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { orderIds } = req.body;
    console.log('=== CREATE BATCH ===', orderIds);

    if (!orderIds || orderIds.length === 0) {
      return res.status(400).json({ message: 'No orders selected' });
    }

    const batch = new Batch({ orders: orderIds });
    await batch.save();
    console.log('Batch saved:', batch.batchID);

    await Order.updateMany(
      { _id: { $in: orderIds } },
      { status: 'In Progress' }
    );

    const io = req.app.get('io');
    io.emit('batchCreated', batch);

    res.status(201).json(batch);
  } catch (err) {
    console.error('BATCH CREATE ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('orders')
      .sort({ createdAt: -1 });
    res.json(batches);
  } catch (err) {
    console.error('BATCH GET ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    console.log('=== COMPLETE BATCH ===', req.params.id);

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      { status: 'Completed', completedAt: new Date() },
      { returnDocument: 'after' }
    );

    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await Order.updateMany(
      { _id: { $in: batch.orders } },
      { status: 'Ready' }
    );
    console.log('Batch completed, orders set to Ready');

    const io = req.app.get('io');
    io.emit('batchCompleted', batch);

    res.json(batch);
  } catch (err) {
    console.error('BATCH COMPLETE ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;