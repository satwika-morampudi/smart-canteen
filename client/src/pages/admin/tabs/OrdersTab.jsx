import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus, markOrderPaid } from '../../../api/api';
import { io } from 'socket.io-client';
import CONFIG from '../../../config';

const STATUS_COLORS = {
  'Pending':     'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Ready':       'bg-green-100 text-green-700',
  'Delivered':   'bg-gray-100 text-gray-600',
};

const STATUS_FLOW = ['Pending', 'In Progress', 'Ready', 'Delivered'];

const OrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    const socket = io(CONFIG.SOCKET_URL);
    socket.on('newOrder', (order) => {
      setOrders(prev => [order, ...prev]);
    });
    socket.on('orderUpdated', (updatedOrder) => {
      setOrders(prev =>
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
    });

    return () => socket.disconnect();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, currentStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === STATUS_FLOW.length - 1) return;
    const nextStatus = STATUS_FLOW[currentIndex + 1];

    try {
      await updateOrderStatus(orderId, nextStatus);
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, status: nextStatus } : o)
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleMarkPaid = async (orderId) => {
    try {
      await markOrderPaid(orderId);
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, isPaid: true } : o)
      );
    } catch (err) {
      alert('Failed to mark as paid');
    }
  };

  const filtered = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter);

  if (loading) return (
    <div className="text-center py-20 text-orange-500 animate-pulse">
      Loading orders...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          All Orders
          <span className="ml-2 bg-orange-100 text-orange-600 text-sm px-2 py-0.5 rounded-full">
            {orders.length}
          </span>
        </h2>
        <button
          onClick={fetchOrders}
          className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'Pending', 'In Progress', 'Ready', 'Delivered'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${filter === s
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-600 border hover:bg-orange-50'
              }`}
          >
            {s}
            <span className="ml-1 text-xs opacity-70">
              ({s === 'All' ? orders.length : orders.filter(o => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📋</div>
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => (
            <div key={order._id}
              className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition">

              {/* Order header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {order.orderID}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Table {order.tableNumber} · {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-orange-500 text-lg">₹{order.totalAmount}</p>
                  <span className={`text-xs font-medium ${order.isPaid ? 'text-green-500' : 'text-red-400'}`}>
                    {order.isPaid ? '✓ Paid' : '⚠ Unpaid'}
                  </span>
                </div>
              </div>

              {/* Items (UPDATED WITH NOTES) */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                {order.items.map((item, i) => (
                  <div key={i} className="py-0.5">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-orange-500 mt-0.5">
                        📝 {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {order.status !== 'Delivered' && (
                  <button
                    onClick={() => handleStatusUpdate(order._id, order.status)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    → Mark as {STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]}
                  </button>
                )}

                {!order.isPaid && (
                  <button
                    onClick={() => handleMarkPaid(order._id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                  >
                    ✓ Mark Paid
                  </button>
                )}

                <span className={`px-3 py-2 rounded-lg text-xs font-medium
                  ${order.paymentMode === 'Online'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                  }`}>
                  {order.paymentMode === 'Online' ? '📱 Online' : '💵 Counter'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersTab;