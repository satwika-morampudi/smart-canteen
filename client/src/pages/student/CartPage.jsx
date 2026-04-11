import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';

const CartPage = () => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart, totalPrice, updateNote } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <div className="text-7xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some delicious items from the menu!</p>
          <button
            onClick={() => navigate('/')}
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Order 🛒</h1>

        {/* Cart items */}
        <div className="space-y-3 mb-6">
          {cartItems.map(item => (
            <div
              key={item._id}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">🍱</div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.name}</h3>
                  <p className="text-orange-500 font-bold">₹{item.price}</p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold hover:bg-orange-200 transition"
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition"
                  >
                    +
                  </button>
                </div>

                {/* Item total */}
                <div className="text-right min-w-16">
                  <p className="font-bold text-gray-700">
                    ₹{item.price * item.quantity}
                  </p>
                  <button
                    onClick={() => deleteFromCart(item._id)}
                    className="text-red-400 text-xs hover:text-red-600 transition"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Special request note */}
              <div className="border-t border-gray-50 pt-3">
                <input
                  type="text"
                  placeholder="Special request? (e.g. less spicy, no onion)"
                  value={item.note || ''}
                  onChange={(e) => updateNote(item._id, e.target.value)}
                  className="w-full text-xs border border-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:border-orange-300 text-gray-600 placeholder-gray-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
          {cartItems.map(item => (
            <div key={item._id} className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{item.name} × {item.quantity}</span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">₹{totalPrice}</span>
          </div>
        </div>

        {/* Checkout button */}
        <button
          onClick={() => navigate('/payment')}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition shadow-md"
        >
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
};

export default CartPage;