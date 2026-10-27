import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Customer pages
import ProductList from '../pages/customer/ProductList';
import ProductDetail from '../pages/customer/ProductDetail';
import Login from '../pages/customer/Login';
import Register from '../pages/customer/Register';
import Cart from '../pages/customer/Cart';
import Wishlist from '../pages/customer/Wishlist';
import AddressManager from '../pages/customer/AddressManager';
import Checkout from '../pages/customer/Checkout';
import Orders from '../pages/customer/Orders';
import OrderDetail from '../pages/customer/OrderDetail';
import Returns from '../pages/customer/Returns';

// Legacy Admin pages (SELLER + SUPER_ADMIN access)
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminReturns from '../pages/admin/AdminReturns';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AuditLogsAdmin from '../pages/admin/AuditLogsAdmin';
import SettingsAdmin from '../pages/admin/SettingsAdmin';
import AdminLayout from '../components/admin/AdminLayout';

// Seller portal
import SellerLayout from '../components/seller/SellerLayout';
import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerOrders from '../pages/seller/SellerOrders';
import SellerProducts from '../pages/seller/SellerProducts';
import SellerBoosts from '../pages/seller/SellerBoosts';
import SellerBalance from '../pages/seller/SellerBalance';

// Super Admin portal
import SuperAdminLayout from '../components/superadmin/SuperAdminLayout';
import SuperAdminDashboard from '../pages/superadmin/SuperAdminDashboard';
import ShopApprovals from '../pages/superadmin/ShopApprovals';
import CommissionSettings from '../pages/superadmin/CommissionSettings';
import BoostManagement from '../pages/superadmin/BoostManagement';
import PayoutManagement from '../pages/superadmin/PayoutManagement';
import PlatformSettingsPage from '../pages/superadmin/PlatformSettingsPage';

// Developer portal
import DevLayout from '../components/dev/DevLayout';
import DeveloperDashboard from '../pages/dev/DeveloperDashboard';

// Route guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';
import SuperAdminRoute from './SuperAdminRoute';
import DevRoute from './DevRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ── Public Customer Routes ─────────────────────────────────── */}
      <Route path="/" element={<ProductList />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Protected Customer Routes ──────────────────────────────── */}
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/addresses" element={<ProtectedRoute><AddressManager /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
      <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />

      {/* ── Legacy Admin Routes (SELLER + SUPER_ADMIN) ─────────────── */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="audit-logs" element={<AuditLogsAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>

      {/* ── Seller Portal ──────────────────────────────────────────── */}
      <Route path="/seller" element={<SellerRoute><SellerLayout /></SellerRoute>}>
        <Route index element={<SellerDashboard />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="boosts" element={<SellerBoosts />} />
        <Route path="balance" element={<SellerBalance />} />
      </Route>

      {/* ── Super Admin Portal ─────────────────────────────────────── */}
      <Route path="/superadmin" element={<SuperAdminRoute><SuperAdminLayout /></SuperAdminRoute>}>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="shops" element={<ShopApprovals />} />
        <Route path="commission" element={<CommissionSettings />} />
        <Route path="boosts" element={<BoostManagement />} />
        <Route path="payouts" element={<PayoutManagement />} />
        <Route path="settings" element={<PlatformSettingsPage />} />
      </Route>

      {/* ── Developer Portal ───────────────────────────────────────── */}
      <Route path="/dev" element={<DevRoute><DevLayout /></DevRoute>}>
        <Route index element={<DeveloperDashboard />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
