import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Add item or increase quantity
  const addToCart = (item, note = '') => {
  setCartItems(prev => {
    const existing = prev.find(i => i._id === item._id);
    if (existing) {
      return prev.map(i =>
        i._id === item._id
          ? { ...i, quantity: i.quantity + 1, note: note || i.note }
          : i
      );
    }
    return [...prev, { ...item, quantity: 1, note }];
  });
};

const updateNote = (itemId, note) => {
  setCartItems(prev =>
    prev.map(i => i._id === itemId ? { ...i, note } : i)
  );
};

  // Decrease quantity or remove
  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === itemId);
      if (existing?.quantity === 1) {
        return prev.filter(i => i._id !== itemId);
      }
      return prev.map(i =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  // Remove item completely
  const deleteFromCart = (itemId) => {
    setCartItems(prev => prev.filter(i => i._id !== itemId));
  };

  // Clear entire cart
  const clearCart = () => setCartItems([]);

  // Total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  // Total items count for badge
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  return (
    <CartContext.Provider value={{
  cartItems, addToCart, removeFromCart,
  deleteFromCart, clearCart, totalPrice,
  totalItems, updateNote
}}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);