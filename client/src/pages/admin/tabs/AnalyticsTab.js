import { useEffect, useState } from 'react';
import { getOrders, getMenu } from '../../../api/api';

const AnalyticsTab = () => {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([
          getOrders(),
          getMenu()
        ]);
        setOrders(ordersRes.data);
        setMenuItems(menuRes.data);
      } catch (err) {
        console.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ CSV DOWNLOAD FUNCTION (added here)
  const downloadCSV = () => {
    const today = new Date().toDateString();

    const todayOrders = orders.filter(o =>
      new Date(o.createdAt).toDateString() === today
    );

    if (todayOrders.length === 0) {
      return alert('No orders today to export');
    }

    const rows = [
      ['Order ID', 'Items', 'Total', 'Payment Mode', 'Paid', 'Status', 'Time'],
      ...todayOrders.map(o => [
        o.orderID,
        o.items.map(i => `${i.name}x${i.quantity}`).join(' + '),
        `Rs.${o.totalAmount}`,
        o.paymentMode,
        o.isPaid ? 'Yes' : 'No',
        o.status,
        new Date(o.createdAt).toLocaleTimeString()
      ])
    ];

    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `canteen-report-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="text-center py-20 text-orange-500 animate-pulse">Loading analytics...</div>
  );

  // Calculate stats
  const totalRevenue = orders
    .filter(o => o.isPaid)
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const statusCounts = {
    Pending: orders.filter(o => o.status === 'Pending').length,
    'In Progress': orders.filter(o => o.status === 'In Progress').length,
    Ready: orders.filter(o => o.status === 'Ready').length,
    Delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  const itemCounts = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });
  });

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCount = topItems[0]?.[1] || 1;

  const topRated = [...menuItems]
    .filter(i => i.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <div className="space-y-6">

      {/* ✅ EXPORT BUTTON (added here) */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Analytics Overview</h2>
        <button
          onClick={downloadCSV}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-xl font-semibold transition flex items-center gap-2"
        >
          ⬇️ Export Today's Report
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Orders', value: orders.length, icon: '📋', color: 'bg-blue-50 text-blue-600' },
          { label: 'Revenue', value: `₹${totalRevenue}`, icon: '💰', color: 'bg-green-50 text-green-600' },
          { label: 'Delivered', value: statusCounts.Delivered, icon: '✅', color: 'bg-teal-50 text-teal-600' },
          { label: 'Pending', value: statusCounts.Pending, icon: '⏳', color: 'bg-yellow-50 text-yellow-600' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-2xl p-4`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-70">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Order status breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Orders by Status</h3>
        <div className="space-y-3">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-24">{status}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                <div
                  className="h-4 bg-orange-400 rounded-full transition-all duration-500"
                  style={{ width: orders.length ? `${(count / orders.length) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 w-6">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top ordered items */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Top 5 Most Ordered Items 🏆</h3>
        {topItems.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No orders yet</p>
        ) : (
          <div className="space-y-3">
            {topItems.map(([name, count], index) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-lg w-6">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                </span>
                <span className="text-sm text-gray-700 flex-1">{name}</span>
                <div className="w-32 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-3 bg-orange-400 rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-orange-500 w-8">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top rated items */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Top Rated Items ⭐</h3>
        {topRated.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No ratings yet</p>
        ) : (
          <div className="space-y-2">
            {topRated.map(item => (
              <div key={item._id}
                className="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-3">
                <span className="font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-bold text-gray-700">{item.rating}</span>
                  <span className="text-xs text-gray-400">({item.totalRatings} reviews)</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;