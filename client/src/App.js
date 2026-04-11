import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import KitchenDisplay from './pages/KitchenDisplay';
import OrderHistory from './pages/student/OrderHistory';

// Student pages
import MenuPage from './pages/student/MenuPage';
import CartPage from './pages/student/CartPage';
import PaymentPage from './pages/student/PaymentPage';
import OrderConfirmation from './pages/student/OrderConfirmation';
import OrderTracking from './pages/student/OrderTracking';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Student routes */}
            <Route path="/" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/confirmation/:orderId" element={<OrderConfirmation />} />
            <Route path="/track/:orderId" element={<OrderTracking />} />
            <Route path="/kitchen" element={<KitchenDisplay />} />
            <Route path="/history" element={<OrderHistory />} />

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;