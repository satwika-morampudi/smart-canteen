import { useEffect, useState } from 'react';
import { getOrders } from '../api/api';
import { io } from 'socket.io-client';
import CONFIG from '../config';
// const STATUS_CONFIG = {
//   'Pending':     { bg: 'bg-yellow-50',  border: 'border-yellow-300', badge: 'bg-yellow-100 text-yellow-700', icon: '🕐' },
//   'In Progress': { bg: 'bg-blue-50',    border: 'border-blue-300',   badge: 'bg-blue-100 text-blue-700',     icon: '👨‍🍳' },
//   'Ready':       { bg: 'bg-green-50',   border: 'border-green-300',  badge: 'bg-green-100 text-green-700',   icon: '✅' },
// };

const KitchenDisplay = () => {
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchOrders();

    // Real-time updates
    const socket = io(CONFIG.SOCKET_URL);
    socket.on('newOrder', () => fetchOrders());
    socket.on('orderUpdated', () => fetchOrders());
    socket.on('batchCompleted', () => fetchOrders());

    // Clock update
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto refresh every 30 seconds
    const refreshInterval = setInterval(fetchOrders, 30000);

    return () => {
      socket.disconnect();
      clearInterval(clockInterval);
      clearInterval(refreshInterval);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      // Only show active orders (not delivered)
      const active = res.data.filter(o =>
        ['Pending', 'In Progress', 'Ready'].includes(o.status)
      );
      setOrders(active);
    } catch (err) {
      console.error('Failed to fetch orders');
    }
  };

  const pendingOrders    = orders.filter(o => o.status === 'Pending');
  const inProgressOrders = orders.filter(o => o.status === 'In Progress');
  const readyOrders      = orders.filter(o => o.status === 'Ready');

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 bg-gray-800 rounded-2xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍽️</span>
          <div>
            <h1 className="text-2xl font-bold">Smart Canteen — Kitchen Display</h1>
            <p className="text-gray-400 text-sm">Live order tracking for kitchen staff</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-400">
            {currentTime.toLocaleTimeString()}
          </p>
          <p className="text-gray-400 text-sm">
            {currentTime.toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending',     count: pendingOrders.length,    color: 'bg-yellow-500' },
          { label: 'In Progress', count: inProgressOrders.length, color: 'bg-blue-500' },
          { label: 'Ready',       count: readyOrders.length,      color: 'bg-green-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-800 rounded-2xl p-4 text-center">
            <div className={`text-4xl font-bold ${stat.color.replace('bg-', 'text-')}`}>
              {stat.count}
            </div>
            <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: '🕐 Pending',     orders: pendingOrders,    color: 'border-yellow-500' },
          { title: '👨‍🍳 In Progress', orders: inProgressOrders, color: 'border-blue-500' },
          { title: '✅ Ready',       orders: readyOrders,      color: 'border-green-500' },
        ].map(col => (
          <div key={col.title}
            className={`bg-gray-800 rounded-2xl border-t-4 ${col.color} p-4`}>
            <h2 className="font-bold text-lg mb-4 text-white">
              {col.title}
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({col.orders.length})
              </span>
            </h2>

            {col.orders.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <div className="text-4xl mb-2">—</div>
                <p className="text-sm">No orders</p>
              </div>
            ) : (
              <div className="space-y-3">
                {col.orders.map(order => (
                  <div key={order._id}
                    className="bg-gray-700 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-orange-400 text-lg">
                        {order.orderID}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded-lg">
                        Table {order.tableNumber}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1">
                      {order.items.map((item, i) => (
                        <div key={i}
                          className="flex justify-between text-sm text-gray-300">
                          <span>{item.name}</span>
                          <span className="font-bold text-white">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Time */}
                    <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()} ·
                      ⏱ {order.estimatedTime} min est.
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-gray-600 text-xs">
        Updates automatically · Go to /admin/dashboard to manage orders
      </div>
    </div>
  );
};

export default KitchenDisplay;