import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import { ShoppingCart, User, ShieldCheck, LogOut, Package } from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-amazon-blue text-white py-3 px-6 flex items-center justify-between shadow-md">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight">
          <span className="text-white">amazon</span>
          <span className="text-amazon-orange text-sm font-semibold">.clone</span>
        </Link>

        <div className="flex items-center space-x-6 text-sm">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-amazon-yellow" />
                <span>Hello, <strong className="text-amazon-yellow">{user?.firstName}</strong> ({user?.role})</span>
              </div>

              {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-1 bg-amazon-orange hover:bg-yellow-500 text-amazon-blue px-3 py-1.5 rounded font-semibold transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}

              <button
                onClick={() => dispatch(logout())}
                className="flex items-center space-x-1 text-gray-300 hover:text-white transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue px-4 py-1.5 rounded font-medium transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-gray-300 hover:text-white transition"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <Package className="w-16 h-16 text-amazon-orange mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Welcome to Amazon Full-Stack Platform
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Phase 1 Infrastructure & Authentication is active. REST API running with Express, Sequelize ORM, and MySQL.
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left mt-8">
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-amazon-blue mb-1">Customer Credentials</h3>
              <p className="text-xs text-gray-600">Email: customer@amazon.com</p>
              <p className="text-xs text-gray-600">Password: Customer123!</p>
            </div>
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-amazon-blue mb-1">Admin Credentials</h3>
              <p className="text-xs text-gray-600">Email: admin@amazon.com</p>
              <p className="text-xs text-gray-600">Password: Admin123!</p>
            </div>
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold text-amazon-blue mb-1">Super Admin Credentials</h3>
              <p className="text-xs text-gray-600">Email: superadmin@amazon.com</p>
              <p className="text-xs text-gray-600">Password: SuperAdmin123!</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
