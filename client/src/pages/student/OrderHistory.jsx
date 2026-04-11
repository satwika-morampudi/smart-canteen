import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getMenu } from '../../api/api';
import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

const OrderHistory = () => {
  const [pastOrders, setPastOrders] = useState([]);
  const [menuItems, setMenuItems]   = useState([]);
  const [reordering, setReordering] = useState(null);
  const { addToCart, clearCart }    = useCart();
  const navigate                    = useNavigate();

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem('pastOrders') || '[]');
    setPastOrders(orders);
    getMenu().then(res => setMenuItems(res.data));
  }, []);

  const handleReorder = async (order) => {
    setReordering(order._id);
    clearCart();

    // Match past items with current menu
    let addedCount = 0;
    for (const item of order.items) {
      const currentItem = menuItems.find(
        m => m.name === item.name && m.isAvailable
      );
      if (currentItem) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(currentItem);
        }
        addedCount++;
      }
    }

    setReordering(null);

    if (addedCount === 0) {
      alert('Sorry, none of these items are currently available');
    } else {
      navigate('/cart');
    }
  };

  if (pastOrders.length === 0) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="text-7xl mb-4">📋</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">No order history</h2>
        <p className="text-gray-400 mb-6">Your past orders will appear here</p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition"
        >
          Order Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Your Order History 📋
        </h1>

        <div className="space-y-4">
          {pastOrders.map((order, index) => (
            <div key={index}
              className="bg-white rounded-2xl shadow-sm p-5">

              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{order.orderID}</h3>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="font-bold text-orange-500 text-lg">
                  ₹{order.totalAmount}
                </span>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-3 mb-3">
                {order.items.map((item, i) => (
                  <div key={i}
                    className="flex justify-between text-sm text-gray-600 py-0.5">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Reorder button */}
              <button
                onClick={() => handleReorder(order)}
                disabled={reordering === order._id}
                className="w-full bg-orange-500 text-white py-2.5 rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50"
              >
                {reordering === order._id ? 'Adding to cart...' : '🔁 Reorder This'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Showing last {pastOrders.length} orders from this device
        </p>
      </div>
    </div>
  );
};

export default OrderHistory;