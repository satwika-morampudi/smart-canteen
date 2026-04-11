import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, adminToken } = useAuth();
  const navigate = useNavigate();

  // Already logged in
  useEffect(() => {
  if (adminToken) {
    navigate('/admin/dashboard');
  }
}, [adminToken, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginAdmin({ email, password });
      login(res.data.token, res.data.user);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🍽️</div>
          <h1 className="text-2xl font-bold text-gray-800">Canteen Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Sign in to manage your canteen</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@canteen.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-400 text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          This page is only for canteen staff
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;