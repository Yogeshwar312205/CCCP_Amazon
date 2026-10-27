import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, ShieldCheck, LogOut, Heart, MapPin, Package, RotateCcw, Store, Terminal, Crown } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { setFilter, fetchProducts } from '../../features/products/productSlice';
import { fetchCategories } from '../../features/categories/categorySlice';
import { fetchCart } from '../../features/cart/cartSlice';
import NotificationDropdown from '../common/NotificationDropdown';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { categories } = useSelector((state) => state.categories);
  const { filters } = useSelector((state) => state.products);
  const { totalItems } = useSelector((state) => state.cart);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');

  useEffect(() => {
    dispatch(fetchCategories());
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilter({ search: searchTerm, category: selectedCategory }));
    dispatch(fetchProducts({ ...filters, search: searchTerm, category: selectedCategory, page: 1 }));
    navigate('/products');
  };

  return (
    <header className="bg-amazon-blue text-white sticky top-0 z-50 shadow-md">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-1 text-2xl font-bold tracking-tight">
          <span className="text-white">amazon</span>
          <span className="text-amazon-orange text-xs font-semibold">.clone</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-grow max-w-3xl flex items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-gray-200 text-gray-800 text-xs px-2 py-2 rounded-l border-r border-gray-300 focus:outline-none cursor-pointer hidden md:block"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Amazon"
            className="w-full px-4 py-2 text-sm text-gray-900 focus:outline-none border-0"
          />

          <button
            type="submit"
            className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue px-4 py-2.5 rounded-r flex items-center justify-center transition"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>

        {/* User & Nav Links */}
        <div className="flex items-center space-x-6 text-xs md:text-sm">
          {isAuthenticated ? (
            <div className="relative group cursor-pointer">
              <div className="flex items-center space-x-1 py-1">
                <User className="w-5 h-5 text-amazon-yellow" />
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] text-gray-300">Hello, {user?.firstName}</p>
                  <p className="font-bold text-white text-xs">Account & Lists</p>
                </div>
              </div>

              {/* Hover Dropdown */}
              <div className="absolute right-0 top-full hidden group-hover:block bg-white text-gray-800 shadow-lg rounded border w-48 py-2 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="font-bold text-xs">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-gray-500">{user?.email}</p>
                </div>

                <Link
                  to="/orders"
                  className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold"
                >
                  <Package className="w-4 h-4 text-amazon-orange" />
                  <span>Your Orders</span>
                </Link>

                <Link
                  to="/returns"
                  className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold"
                >
                  <RotateCcw className="w-4 h-4 text-amazon-orange" />
                  <span>Returns & Refunds</span>
                </Link>

                <Link
                  to="/addresses"
                  className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold"
                >
                  <MapPin className="w-4 h-4 text-amazon-orange" />
                  <span>Addresses</span>
                </Link>

                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold text-amazon-orange"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                {user?.role === 'SELLER' && (
                  <Link
                    to="/seller"
                    className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold text-blue-600"
                  >
                    <Store className="w-4 h-4" />
                    <span>Seller Portal</span>
                  </Link>
                )}

                {user?.role === 'SUPER_ADMIN' && (
                  <Link
                    to="/superadmin"
                    className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold text-purple-600"
                  >
                    <Crown className="w-4 h-4" />
                    <span>Business Portal</span>
                  </Link>
                )}

                {user?.role === 'DEVELOPER' && (
                  <Link
                    to="/dev"
                    className="flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 font-semibold text-green-600"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Dev Dashboard</span>
                  </Link>
                )}

                <button
                  onClick={() => dispatch(logout())}
                  className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs hover:bg-gray-100 text-red-600 border-t mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="flex flex-col text-left">
              <span className="text-[10px] text-gray-300">Hello, sign in</span>
              <span className="font-bold text-white text-xs">Account & Lists</span>
            </Link>
          )}

          <Link to="/orders" className="flex flex-col text-left hover:text-amazon-yellow">
            <span className="text-[10px] text-gray-300">Returns</span>
            <span className="font-bold text-white text-xs">& Orders</span>
          </Link>

          {isAuthenticated && <NotificationDropdown />}

          <Link to="/wishlist" className="flex items-center space-x-1 hover:text-amazon-yellow">
            <Heart className="w-5 h-5" />
            <span className="hidden sm:inline text-xs font-bold">Wishlist</span>
          </Link>

          <Link to="/cart" className="flex items-center space-x-1 relative hover:text-amazon-yellow">
            <div className="relative">
              <ShoppingCart className="w-7 h-7" />
              <span className="absolute -top-1 -right-2 bg-amazon-orange text-amazon-blue text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {totalItems || 0}
              </span>
            </div>
            <span className="hidden sm:inline text-xs font-bold mt-2">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
