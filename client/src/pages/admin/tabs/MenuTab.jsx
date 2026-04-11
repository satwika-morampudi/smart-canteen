import { useEffect, useState } from 'react';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../../../api/api';

const CATEGORIES = ['Breakfast', 'Lunch', 'Snacks', 'Beverages', 'Dinner'];

const EMPTY_FORM = {
  name: '',
  price: '',
  category: 'Breakfast',
  prepTime: '5',
  isAvailable: true,
  image: '' // ✅ added
};

const MenuTab = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMenu(); }, []);

  const fetchMenu = async () => {
    try {
      const res = await getMenu();
      setMenuItems(res.data);
    } catch (err) {
      console.error('Failed to fetch menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMenuItem(editingId, {
          ...form,
          price: Number(form.price),
          prepTime: Number(form.prepTime)
        });
      } else {
        await addMenuItem({
          ...form,
          price: Number(form.price),
          prepTime: Number(form.prepTime)
        });
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      fetchMenu();
    } catch (err) {
      alert('Failed to save item');
    }
  };

  const handleEdit = (item) => {
    setForm({
      name: item.name,
      price: item.price,
      category: item.category,
      prepTime: item.prepTime,
      isAvailable: item.isAvailable,
      image: item.image || '' // ✅ added
    });
    setEditingId(item._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
// eslint-disable-next-line no-unused-vars
const handleToggleAvailable = async (item) => {
    try {
      await updateMenuItem(item._id, { isAvailable: !item.isAvailable });
      fetchMenu();
    } catch (err) {
      alert('Failed to update item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await deleteMenuItem(id);
      fetchMenu();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  if (loading) return (
    <div className="text-center py-20 text-orange-500 animate-pulse">Loading...</div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Menu Items
          <span className="ml-2 bg-orange-100 text-orange-600 text-sm px-2 py-0.5 rounded-full">
            {menuItems.length}
          </span>
        </h2>
        <button
          onClick={() => { setShowForm(!showForm); setForm(EMPTY_FORM); setEditingId(null); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-semibold transition"
        >
          {showForm ? '✕ Cancel' : '+ Add Item'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border-2 border-orange-100">
          <h3 className="font-bold text-gray-700 mb-4">
            {editingId ? '✏️ Edit Item' : '➕ Add New Item'}
          </h3>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Item Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Price (₹)</label>
              <input
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
                required
                min="1"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Prep Time */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">Prep Time (mins)</label>
              <input
                type="number"
                value={form.prepTime}
                onChange={e => setForm({ ...form, prepTime: e.target.value })}
                min="1"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5"
              />
            </div>

            {/* ✅ Image URL FIELD */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Image URL (optional)
              </label>
              <input
                type="text"
                value={form.image}
                onChange={e => setForm({ ...form, image: e.target.value })}
                placeholder="Paste image URL from internet"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5"
              />
              {form.image && (
                <img
                  src={form.image}
                  alt="preview"
                  className="mt-2 h-24 w-24 object-cover rounded-xl"
                  onError={e => e.target.style.display = 'none'}
                />
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                className="w-4 h-4 accent-orange-500"
              />
              <label className="text-sm font-medium text-gray-600">
                Available now
              </label>
            </div>

            {/* Submit */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold"
              >
                {editingId ? 'Update Item ✓' : 'Add to Menu +'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Menu List */}
      {CATEGORIES.map(cat => {
        const items = menuItems.filter(i => i.category === cat);
        if (!items.length) return null;

        return (
          <div key={cat} className="mb-6">
            <h3 className="font-bold text-gray-600 mb-3 text-sm uppercase">
              {cat} ({items.length})
            </h3>

            <div className="space-y-2">
              {items.map(item => (
                <div key={item._id}
                  className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4">

                  {/* ✅ IMAGE PREVIEW */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                  )}

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-400">
                      ₹{item.price} · {item.prepTime} min
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(item)}>✏️</button>
                    <button onClick={() => handleDelete(item._id)}>🗑️</button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuTab;