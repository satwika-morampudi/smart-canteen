import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderById } from '../../api/api';
import { io } from 'socket.io-client';
import CONFIG from '../../config';

const STEPS = ['Pending', 'In Progress', 'Ready', 'Delivered'];

const STEP_INFO = {
  'Pending':     { icon: '🕐', msg: 'Order received — waiting to be prepared' },
  'In Progress': { icon: '👨‍🍳', msg: 'Chef is preparing your food right now!' },
  'Ready':       { icon: '✅', msg: 'Your order is ready! Collect from counter' },
  'Delivered':   { icon: '🎉', msg: 'Enjoy your meal! Thank you for ordering' },
};

const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder]       = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const res = await getOrderById(orderId);
      setOrder(res.data);
      // Calculate remaining time
      if (res.data.status === 'Pending' || res.data.status === 'In Progress') {
        const created   = new Date(res.data.createdAt).getTime();
        const estimated = res.data.estimatedTime * 60 * 1000; // convert to ms
        const elapsed   = Date.now() - created;
        const remaining = Math.max(0, estimated - elapsed);
        setTimeLeft(Math.floor(remaining / 1000));
      }
    };
    fetchOrder();

    const socket = io(CONFIG.SOCKET_URL);
    socket.on('orderUpdated', (updatedOrder) => {
      if (updatedOrder._id === orderId) {
        setOrder(updatedOrder);
        if (updatedOrder.status === 'Ready' || updatedOrder.status === 'Delivered') {
          setTimeLeft(0);
        }
      }
    });

    return () => socket.disconnect();
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 animate-pulse text-xl">Loading order...</div>
    </div>
  );

  const currentStep = STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3 animate-bounce">
            {STEP_INFO[order.status]?.icon}
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Order #{order.orderID}</h1>
          <p className="text-gray-500 mt-1">{STEP_INFO[order.status]?.msg}</p>
        </div>

        {/* Smart countdown timer */}
        {timeLeft !== null && timeLeft > 0 && (
          <div className="bg-orange-500 text-white rounded-3xl p-6 text-center mb-6 shadow-lg">
            <p className="text-orange-100 text-sm mb-1">Estimated time remaining</p>
            <p className="text-5xl font-bold tracking-wider">
              {formatTime(timeLeft)}
            </p>
            <p className="text-orange-100 text-sm mt-2">
              This updates in real time
            </p>
          </div>
        )}

        {/* Ready banner */}
        {order.status === 'Ready' && (
          <div className="bg-green-500 text-white rounded-3xl p-6 text-center mb-6 shadow-lg animate-pulse">
            <p className="text-2xl font-bold">🎉 Your order is ready!</p>
            <p className="text-green-100 mt-1">Please collect from the counter</p>
          </div>
        )}

        {/* Progress steps */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-4">Order Progress</h2>
          {STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-4 mb-4 last:mb-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm
                ${index < currentStep  ? 'bg-green-500 text-white' :
                  index === currentStep ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                  'bg-gray-100 text-gray-400'}`}>
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="flex-1">
                <p className={`font-semibold
                  ${index === currentStep ? 'text-orange-500' :
                    index < currentStep   ? 'text-green-600'  : 'text-gray-400'}`}>
                  {step}
                </p>
                {index === currentStep && (
                  <p className="text-xs text-gray-400">Current status</p>
                )}
              </div>
              {index === currentStep && order.status !== 'Delivered' && (
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"/>
              )}
            </div>
          ))}
        </div>

        {/* Order details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-3">Order Details</h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm text-gray-600 mb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-orange-500">₹{order.totalAmount}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-gray-500">Payment</span>
            <span className={`font-medium ${order.isPaid ? 'text-green-500' : 'text-red-400'}`}>
              {order.isPaid ? '✓ Paid' : 'Pay at Counter'}
            </span>
          </div>
        </div>

        {/* Feedback section — shown only when delivered */}
        {order.status === 'Delivered' && (
          <FeedbackSection order={order} />
        )}
      </div>
    </div>
  );
};

// Feedback component shown after delivery
const FeedbackSection = ({ order }) => {
  const [ratings, setRatings]     = useState({});
  const [submitted, setSubmitted] = useState(false);
  const { submitFeedback }        = require('../../api/api');

  const handleRate = (itemId, rating) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
  };

  const handleSubmit = async () => {
    try {
      for (const item of order.items) {
        if (ratings[item.menuItem]) {
          await submitFeedback({
            orderId:    order._id,
            menuItemId: item.menuItem,
            rating:     ratings[item.menuItem],
          });
        }
      }
      setSubmitted(true);
    } catch (err) {
      alert('Failed to submit feedback');
    }
  };

  if (submitted) return (
    <div className="bg-green-50 rounded-3xl p-6 text-center">
      <div className="text-4xl mb-2">🙏</div>
      <p className="font-bold text-green-700">Thank you for your feedback!</p>
      <p className="text-green-500 text-sm mt-1">Your ratings help us improve</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-700 mb-4">⭐ Rate your order</h2>
      <div className="space-y-4">
        {order.items.map((item, i) => (
          <div key={i}>
            <p className="text-sm font-semibold text-gray-600 mb-2">{item.name}</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => handleRate(item.menuItem, star)}
                  className={`text-2xl transition hover:scale-110
                    ${ratings[item.menuItem] >= star
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                    }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={Object.keys(ratings).length === 0}
        className="w-full mt-4 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition disabled:opacity-50"
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default OrderTracking;