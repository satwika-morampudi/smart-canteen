const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Menu = require('../models/Menu');
const auth = require('../middleware/auth');

// POST /api/orders - Place new order (public - students)
router.post('/', async (req, res) => {
  try {
    const { items, paymentMode, tableNumber } = req.body;

    console.log('=== NEW ORDER REQUEST ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // Validate request
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }
    if (!paymentMode) {
      return res.status(400).json({ message: 'Payment mode required' });
    }

    let totalAmount = 0;
    let maxPrepTime = 0;
    const orderItems = [];

    for (const item of items) {
      const itemId = item.menuItemId || item._id;
      console.log('Looking for menu item:', itemId);

      const menuItem = await Menu.findById(itemId);
      console.log('Found menu item:', menuItem?.name);

      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found: ${itemId}` });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({ message: `${menuItem.name} is sold out` });
      }

      totalAmount += menuItem.price * item.quantity;
      maxPrepTime = Math.max(maxPrepTime, menuItem.prepTime || 5);

      orderItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        note: item.note || ''
      });
    }

    // Count pending + in-progress orders
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['Pending', 'In Progress'] }
    });

    const estimatedTime = maxPrepTime + (pendingOrders * 2);

    const order = new Order({
      items: orderItems,
      totalAmount,
      paymentMode,
      tableNumber: tableNumber || 'N/A',
      estimatedTime,
      isPaid: paymentMode === 'Online'
    });

    console.log('Saving order...');
    await order.save();
    console.log('Order saved! ID:', order.orderID);

    // Emit real-time event
    const io = req.app.get('io');
    io.emit('newOrder', order);

    res.status(201).json(order);

  } catch (err) {
    console.error('=== ORDER ERROR ===');
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/orders - Get all orders (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single order
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
     { returnDocument: 'after' }
    );

    const io = req.app.get('io');
    io.emit('orderUpdated', order);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Mark as paid
router.put('/:id/pay', auth, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { isPaid: true },
      { returnDocument: 'after' }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;