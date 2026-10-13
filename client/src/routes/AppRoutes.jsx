import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminInventory from '../pages/admin/AdminInventory';
import AdminReturns from '../pages/admin/AdminReturns';
import AdminCoupons from '../pages/admin/AdminCoupons';
import AuditLogsAdmin from '../pages/admin/AuditLogsAdmin';
import SettingsAdmin from '../pages/admin/SettingsAdmin';
import AdminLayout from '../components/admin/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Customer Routes */}
      <Route path="/" element={<ProductList />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Customer Routes */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/addresses"
        element={
          <ProtectedRoute>
            <AddressManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <Returns />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="returns" element={<AdminReturns />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="audit-logs" element={<AuditLogsAdmin />} />
        <Route path="settings" element={<SettingsAdmin />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
