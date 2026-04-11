import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-orange-500 text-white px-4 py-3 flex items-center justify-between shadow-md sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">🍽️</span>
        <Link to="/" className="text-xl font-bold tracking-wide">
          Smart Canteen
        </Link>
      </div>

      {/* Cart button */}
      <button
        onClick={() => navigate('/cart')}
        className="relative bg-white text-orange-500 font-semibold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-orange-50 transition"
      >
        🛒 Cart
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </button>
      <button
  onClick={() => navigate('/history')}
  className="bg-white text-orange-500 font-semibold px-4 py-2 rounded-full hover:bg-orange-50 transition text-sm"
>
  📋 History
</button>
    </nav>
  );
};

export default Navbar;