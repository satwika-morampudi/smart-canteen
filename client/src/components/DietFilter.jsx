import { useState } from 'react';
import { useCart } from '../context/CartContext';

const DIET_PROFILES = [
  { id: 'diabetic',    label: '🩺 Diabetic',      avoid: ['Rice', 'Biryani', 'Pulao', 'Lassi', 'Mango Shake'],    prefer: ['Upma', 'Poha', 'Idli', 'Sambar'] },
  { id: 'highprotein', label: '💪 High Protein',   avoid: [],                                                       prefer: ['Egg', 'Paneer', 'Dal', 'Lassi'] },
  { id: 'lowcalorie',  label: '🥗 Low Calorie',    avoid: ['Biryani', 'Fried', 'Puff', 'Fries', 'Shake'],          prefer: ['Idli', 'Sambhar', 'Chai', 'Upma'] },
  { id: 'vegan',       label: '🌱 Vegan',           avoid: ['Egg', 'Omelette', 'Lassi', 'Coffee', 'Chai', 'Milk'], prefer: ['Dosa', 'Idli', 'Sambhar', 'Upma', 'Poha'] },
  { id: 'quickbite',   label: '⚡ Quick Bite',      avoid: ['Biryani', 'Curry'],                                    prefer: ['Samosa', 'Puff', 'Chai', 'Coffee'] },
];

const DietFilter = ({ menuItems }) => {
  const [active, setActive]   = useState(null);
  const [filtered, setFiltered] = useState([]);
  const { addToCart }           = useCart();

  const applyFilter = (profile) => {
    if (active?.id === profile.id) {
      setActive(null);
      setFiltered([]);
      return;
    }

    setActive(profile);

    const results = menuItems.filter(item => {
      if (!item.isAvailable) return false;
      const name = item.name.toLowerCase();

      // Check avoid list
      const shouldAvoid = profile.avoid.some(a =>
        name.includes(a.toLowerCase())
      );
      if (shouldAvoid) return false;

      return true;
    }).sort((a, b) => {
      // Boost preferred items to top
      const aPreferred = profile.prefer.some(p =>
        a.name.toLowerCase().includes(p.toLowerCase())
      );
      const bPreferred = profile.prefer.some(p =>
        b.name.toLowerCase().includes(p.toLowerCase())
      );
      return bPreferred - aPreferred;
    });

    setFiltered(results);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        🥗 Diet Filter
        <span className="ml-2 text-sm font-normal text-gray-400">
          Select your diet preference
        </span>
      </h2>

      {/* Diet profile buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {DIET_PROFILES.map(profile => (
          <button
            key={profile.id}
            onClick={() => applyFilter(profile)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
              ${active?.id === profile.id
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}
          >
            {profile.label}
          </button>
        ))}
      </div>

      {/* Filtered results */}
      {active && (
        <div className="bg-orange-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-orange-700">
              {active.label} — {filtered.length} items suitable for you
            </p>
            <button
              onClick={() => { setActive(null); setFiltered([]); }}
              className="text-orange-400 text-sm hover:text-orange-600"
            >
              Clear ✕
            </button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-orange-400 text-sm text-center py-4">
              No suitable items found right now
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.slice(0, 6).map(item => (
                <div key={item._id}
                  className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="text-center mb-2">
                    {item.image
                      ? <img src={item.image} alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg mx-auto"/>
                      : <span className="text-3xl">🍽️</span>
                    }
                  </div>
                  <p className="font-semibold text-gray-800 text-sm text-center">{item.name}</p>
                  <p className="text-orange-500 font-bold text-center text-sm mb-2">₹{item.price}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-orange-500 text-white text-xs py-1.5 rounded-full font-medium hover:bg-orange-600 transition"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DietFilter;