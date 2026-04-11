import { useEffect, useState } from 'react';
import { getMenu } from '../../api/api';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar';
import DietFilter from '../../components/DietFilter';
import AIChatbot from '../../components/AIChatbot';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dinner'];
const getCategoryEmoji = (category) => {
  const emojis = {
    'Breakfast': '🍳',
    'Lunch': '🍱',
    'Snacks': '🥪',
    'Beverages': '☕',
    'Dinner': '🍛',
  };
  return emojis[category] || '🍽️';
};

const MenuPage = () => {
  const [menuItems, setMenuItems]       = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]   = useState('');
  const [sortBy, setSortBy]             = useState('default');
  const [loading, setLoading]           = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const { addToCart, cartItems }        = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await getMenu();
        setMenuItems(res.data);
        setFiltered(res.data);
        // Get recommendations from localStorage past orders
        loadRecommendations(res.data);
      } catch (err) {
        console.error('Failed to fetch menu');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  // Load smart recommendations based on past orders
  const loadRecommendations = (items) => {
    const pastOrders = JSON.parse(localStorage.getItem('pastOrders') || '[]');
    if (pastOrders.length === 0) return;

    // Count how many times each item was ordered
    const itemCounts = {};
    pastOrders.forEach(order => {
      order.items?.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + 1;
      });
    });

    // Sort menu items by order frequency
    const recommended = items
      .filter(item => itemCounts[item.name] && item.isAvailable)
      .sort((a, b) => (itemCounts[b.name] || 0) - (itemCounts[a.name] || 0))
      .slice(0, 4);

    setRecommendations(recommended);
  };

  // Apply search + category + sort
  useEffect(() => {
    let result = [...menuItems];

    // Category filter
    if (activeCategory !== 'All') {
      result = result.filter(i => i.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(i =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low')  result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     result.sort((a, b) => b.rating - a.rating);
    if (sortBy === 'prep-time')  result.sort((a, b) => a.prepTime - b.prepTime);

    setFiltered(result);
  }, [searchQuery, activeCategory, sortBy, menuItems]);

  const getCartQty = (id) => {
    const item = cartItems.find(i => i._id === id);
    return item ? item.quantity : 0;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-orange-500 text-xl font-semibold animate-pulse">
        Loading menu...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-1">Welcome to Smart Canteen 🍽️</h1>
        <p className="text-orange-100">Fresh food, fast service — order from your seat!</p>
      </div>

      {/* Search bar */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-16 z-40">
        <div className="max-w-5xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search for food..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >✕</button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-400 text-gray-600"
          >
            <option value="default">Sort by</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="prep-time">Fastest First</option>
          </select>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
              ${activeCategory === cat
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>
{/* Time-based suggestion */}
<TimeBasedSuggestion menuItems={menuItems} addToCart={addToCart} />

{/* Diet filter */}
<DietFilter menuItems={menuItems} />

{/* AI Chatbot */}
<AIChatbot menuItems={menuItems} />

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Smart Recommendations */}
        {recommendations.length > 0 && !searchQuery && activeCategory === 'All' && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-3">
              🔁 Order Again — Your Favourites
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recommendations.map(item => (
                <div key={item._id}
                  className="bg-white rounded-2xl shadow-sm p-4 min-w-40 flex-shrink-0 border border-orange-100">
                  <div className="text-3xl text-center mb-2">🍱</div>
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
          </div>
        )}

        {/* People also ordered */}
        <PeopleAlsoOrdered
          menuItems={menuItems}
          cartItems={cartItems}
          addToCart={addToCart}
        />

        {/* Combo suggester */}
        <ComboSuggester
          menuItems={menuItems}
          addToCart={addToCart}
          cartItems={cartItems}
        />

        {/* Menu grid */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : activeCategory === 'All' ? 'All Items' : activeCategory}
          <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length} items)</span>
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-lg">No items found</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-3 text-orange-500 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(item => (
              <MenuCard
                key={item._id}
                item={item}
                cartQty={getCartQty(item._id)}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Single menu card component
const MenuCard = ({ item, cartQty, addToCart }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
    <div className="bg-orange-50 h-36 flex items-center justify-center overflow-hidden rounded-t-2xl">
  {item.image ? (
    <img
      src={item.image}
      alt={item.name}
      className="h-full w-full object-cover"
      onError={e => {
        e.target.style.display = 'none';
        e.target.nextSibling.style.display = 'flex';
      }}
    />
  ) : null}

  <div
    className="h-full w-full flex items-center justify-center text-5xl"
    style={{ display: item.image ? 'none' : 'flex' }}
  >
    {getCategoryEmoji(item.category)}
  </div>
</div>
    <div className="p-4">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-800">{item.name}</h3>
        {item.rating > 0 && (
          <span className="text-xs text-yellow-500 font-medium">⭐ {item.rating}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
          {item.category}
        </span>
        <span className="text-xs text-gray-400">⏱ {item.prepTime} min</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-orange-500 font-bold text-lg">₹{item.price}</span>
        {!item.isAvailable ? (
          <span className="text-sm text-red-400 font-medium">Sold Out</span>
        ) : cartQty > 0 ? (
          <span className="text-sm text-green-600 font-semibold">✓ Added ({cartQty})</span>
        ) : (
          <button
            onClick={() => addToCart(item)}
            className="bg-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-orange-600 transition"
          >
            + Add
          </button>
        )}
      </div>
    </div>
  </div>
);

// People also ordered component
const PeopleAlsoOrdered = ({ menuItems, cartItems, addToCart }) => {
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (cartItems.length === 0) return;

    // Based on cart items — suggest items from different categories
    const cartCategories = cartItems.map(i => i.category);
    const suggestions = menuItems
      .filter(item =>
        item.isAvailable &&
        !cartItems.find(c => c._id === item._id) &&
        !cartCategories.includes(item.category)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);

    setSuggestions(suggestions);
  }, [cartItems, menuItems]);

  if (suggestions.length === 0 || cartItems.length === 0) return null;

  return (
    <div className="mb-8 bg-orange-50 rounded-2xl p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-3">
        🤝 People also ordered
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {suggestions.map(item => (
          <div key={item._id}
            className="bg-white rounded-xl p-3 min-w-36 flex-shrink-0 shadow-sm">
            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
            <p className="text-xs text-gray-400 mb-2">{item.category}</p>
            <div className="flex items-center justify-between">
              <span className="text-orange-500 font-bold text-sm">₹{item.price}</span>
              <button
                onClick={() => addToCart(item)}
                className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full hover:bg-orange-600 transition"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Combo suggester component
const ComboSuggester = ({ menuItems, addToCart, cartItems }) => {
  const COMBOS = [
    {
      name: 'South Indian Breakfast',
      icon: '🍛',
      items: ['Masala Dosa', 'Idli Sambhar', 'Filter Coffee'],
      description: 'A complete South Indian morning'
    },
    {
      name: 'Quick Snack Combo',
      icon: '☕',
      items: ['Samosa', 'Veg Puff', 'Chai'],
      description: 'Perfect evening snack'
    },
    {
      name: 'Full Meal Deal',
      icon: '🍱',
      items: ['Veg Biryani', 'Lassi', 'Samosa'],
      description: 'A satisfying complete meal'
    },
    {
      name: 'Light Bite',
      icon: '🥪',
      items: ['Sandwich', 'Cold Coffee'],
      description: 'Quick and light'
    },
  ];

  const [showCombos, setShowCombos] = useState(false);

  const addComboToCart = (combo) => {
    combo.items.forEach(itemName => {
      const found = menuItems.find(
        m => m.name === itemName && m.isAvailable
      );
      if (found) addToCart(found);
    });
  };

  const getComboPrice = (combo) => {
    return combo.items.reduce((sum, itemName) => {
      const found = menuItems.find(m => m.name === itemName);
      return sum + (found?.price || 0);
    }, 0);
  };

  const isComboAvailable = (combo) => {
    return combo.items.some(itemName =>
      menuItems.find(m => m.name === itemName && m.isAvailable)
    );
  };

  if (cartItems.length > 0) return null; // hide when cart has items

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">
          🍽️ Popular Combos
        </h2>
        <button
          onClick={() => setShowCombos(!showCombos)}
          className="text-orange-500 text-sm font-medium"
        >
          {showCombos ? 'Hide' : 'Show all'}
        </button>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${!showCombos ? 'max-h-32 overflow-hidden' : ''}`}>
        {COMBOS.filter(isComboAvailable).map(combo => (
          <div key={combo.name}
            className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{combo.icon}</span>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{combo.name}</p>
                <p className="text-xs text-gray-400">{combo.description}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {combo.items.join(' + ')}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-orange-500 font-bold text-sm">
                ₹{getComboPrice(combo)}
              </p>
              <button
                onClick={() => addComboToCart(combo)}
                className="mt-1 bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full hover:bg-orange-600 transition whitespace-nowrap"
              >
                Add All
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const TimeBasedSuggestion = ({ menuItems, addToCart }) => {
  const getTimeSlot = () => {
    const hour = new Date().getHours();
    if (hour >= 6  && hour < 11) return 'Breakfast';
    if (hour >= 11 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Snacks';
    if (hour >= 18 && hour < 22) return 'Dinner';
    return 'Beverages';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 6  && hour < 12) return { text: 'Good morning! 🌅', sub: 'Start your day with a fresh breakfast' };
    if (hour >= 12 && hour < 15) return { text: 'Lunch time! 🍱',   sub: 'Fuel up with a satisfying meal' };
    if (hour >= 15 && hour < 18) return { text: 'Snack time! ☕',   sub: 'Take a break with something light' };
    if (hour >= 18 && hour < 22) return { text: 'Good evening! 🌙', sub: 'End your day with a hearty dinner' };
    return { text: 'Late night cravings? 🌙', sub: 'Something light for you' };
  };

  const slot     = getTimeSlot();
  const greeting = getGreeting();
  const suggested = menuItems
    .filter(i => i.category === slot && i.isAvailable)
    .slice(0, 3);

  if (suggested.length === 0) return null;

  return (
    <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-5 text-white">
      <h2 className="text-lg font-bold mb-1">{greeting.text}</h2>
      <p className="text-orange-100 text-sm mb-4">{greeting.sub}</p>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {suggested.map(item => (
          <div key={item._id}
            className="bg-white bg-opacity-20 rounded-xl p-3 min-w-36 flex-shrink-0">
            <div className="text-2xl mb-1 text-center">
              {item.image
                ? <img src={item.image} alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg mx-auto"/>
                : '🍽️'
              }
            </div>
            <p className="font-semibold text-sm text-center">{item.name}</p>
            <p className="text-orange-100 text-xs text-center mb-2">₹{item.price}</p>
            <button
              onClick={() => addToCart(item)}
              className="w-full bg-white text-orange-500 text-xs py-1 rounded-full font-bold hover:bg-orange-50 transition"
            >
              + Add
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;