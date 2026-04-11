import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import OrdersTab from './tabs/OrdersTab';
import BatchesTab from './tabs/BatchesTab';
import MenuTab from './tabs/MenuTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import QRTab from './tabs/QRTab';

const TABS = [
  { id: 'orders',    label: '📋 Orders' },
  { id: 'batches',   label: '🍳 Batches' },
  { id: 'menu',      label: '🍱 Menu' },
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'qr',        label: '📷 QR Codes' },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { adminInfo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top navbar */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🍽️</span>
          <div>
            <h1 className="font-bold text-lg leading-none">Smart Canteen</h1>
            <p className="text-gray-400 text-xs">Admin Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-300 text-sm hidden sm:block">
            👋 {adminInfo?.name || 'Admin'}
          </span>

          {/* Kitchen Display Button */}
          <a
            href="/kitchen"
            target="_blank"
            rel="noreferrer"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            🖥️ Kitchen Display
          </a>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Tab navigation */}
      <div className="bg-white border-b px-4 sticky top-16 z-40 shadow-sm">
        <div className="flex gap-1 max-w-5xl mx-auto overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition
                ${activeTab === tab.id
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'orders'    && <OrdersTab />}
        {activeTab === 'batches'   && <BatchesTab />}
        {activeTab === 'menu'      && <MenuTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'qr'        && <QRTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;