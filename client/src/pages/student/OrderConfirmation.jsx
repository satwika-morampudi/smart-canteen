import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderById } from '../../api/api';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const res = await getOrderById(orderId);
      setOrder(res.data);
// Save to past orders for recommendations
const pastOrders = JSON.parse(localStorage.getItem('pastOrders') || '[]');
pastOrders.unshift(res.data);
// Keep only last 10 orders
localStorage.setItem('pastOrders', JSON.stringify(pastOrders.slice(0, 10)));
      
    };
    fetch();
  }, [orderId]);

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 animate-pulse text-xl">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">

        {/* Success icon */}
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Order Placed!</h1>
        <p className="text-gray-400 mb-6">Your food is being prepared</p>

        {/* Order ID */}
        <div className="bg-orange-50 rounded-2xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Your Order ID</p>
          <p className="text-2xl font-bold text-orange-500">{order.orderID}</p>
        </div>

        {/* Order details */}
        <div className="text-left space-y-2 mb-6">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-orange-500">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Estimated time */}
        <div className="bg-blue-50 rounded-2xl p-3 mb-6">
          <p className="text-blue-600 font-semibold">
            ⏱ Estimated time: {order.estimatedTime} minutes
          </p>
        </div>

        {/* Track order button */}
        <button
          onClick={() => navigate(`/track/${orderId}`)}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition"
        >
          Track My Order 📍
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;




