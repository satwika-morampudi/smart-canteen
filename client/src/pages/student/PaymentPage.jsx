import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder } from '../../api/api';
import Navbar from '../../components/Navbar';

const PaymentPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // select → processing → done

  const handlePlaceOrder = async () => {
    if (!paymentMode) return alert('Please select a payment method');
    if (!tableNumber) return alert('Please enter your table number');

    setLoading(true);

    // Simulate online payment processing
    if (paymentMode === 'Online') {
      setPaymentStep('processing');
      await new Promise(resolve => setTimeout(resolve, 2500)); // fake delay
      setPaymentStep('done');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    try {
      const orderData = {
        items: cartItems.map(item => ({
          menuItemId: item._id,
          quantity: item.quantity,
          note: item.note || ''
        })),
        totalAmount: totalPrice,
        paymentMode,
        tableNumber
      };

      const res = await placeOrder(orderData);
      clearCart();
      navigate(`/confirmation/${res.data._id}`);
    } catch (err) {
      alert('Failed to place order. Please try again.');
      setPaymentStep('select');
    } finally {
      setLoading(false);
    }
  };

  // Payment processing screen
  if (paymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-4 animate-bounce">💳</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Processing Payment...</h2>
          <p className="text-gray-400">Please wait, do not close this page</p>
          <div className="mt-6 w-48 mx-auto bg-gray-200 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payment 💳</h1>

        {/* Table number input */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            Table Number
          </label>
          <input
            type="text"
            placeholder="e.g. Table 5"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-700"
          />
        </div>

        {/* Payment method selection */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-sm font-semibold text-gray-600 mb-3">Select Payment Method</p>

          <div className="space-y-3">
            {/* Online payment */}
            <div
              onClick={() => setPaymentMode('Online')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition
                ${paymentMode === 'Online'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 hover:border-orange-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="font-semibold text-gray-700">Pay Online</p>
                  <p className="text-xs text-gray-400">UPI / Card / Wallet (Demo)</p>
                </div>
                {paymentMode === 'Online' && (
                  <span className="ml-auto text-orange-500 font-bold">✓</span>
                )}
              </div>

              {/* UPI options shown when selected */}
              {paymentMode === 'Online' && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {['GPay', 'PhonePe', 'Paytm', 'Card'].map(opt => (
                    <span key={opt}
                      className="bg-orange-100 text-orange-600 text-xs px-3 py-1 rounded-full font-medium">
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Pay at counter */}
            <div
              onClick={() => setPaymentMode('Counter')}
              className={`border-2 rounded-xl p-4 cursor-pointer transition
                ${paymentMode === 'Counter'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 hover:border-orange-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💵</span>
                <div>
                  <p className="font-semibold text-gray-700">Pay at Counter</p>
                  <p className="text-xs text-gray-400">Cash or UPI at the canteen</p>
                </div>
                {paymentMode === 'Counter' && (
                  <span className="ml-auto text-orange-500 font-bold">✓</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order total */}
        <div className="bg-orange-50 rounded-2xl p-4 mb-6 flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Amount</span>
          <span className="text-2xl font-bold text-orange-500">₹{totalPrice}</span>
        </div>

        {/* Place order button */}
        <button
          onClick={handlePlaceOrder}
          disabled={loading || !paymentMode || !tableNumber}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg
            hover:bg-orange-600 transition shadow-md
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Placing Order...' : 'Place Order 🎉'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;