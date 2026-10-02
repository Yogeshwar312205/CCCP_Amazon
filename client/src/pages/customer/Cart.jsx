import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/customer/Header';
import Navbar from '../../components/customer/Navbar';
import {
  fetchCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  clearCartError,
} from '../../features/auth/../cart/cartSlice';
import { ShoppingCart, Trash2, ShieldCheck, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, totalItems, subtotal, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <Navbar />
        <main className="max-w-4xl mx-auto p-8 text-center my-12 bg-white border rounded-lg shadow-sm">
          <ShoppingCart className="w-16 h-16 text-amazon-orange mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Amazon Cart is empty</h2>
          <p className="text-gray-600 text-sm mb-6">Sign in to view your saved items and proceed to checkout.</p>
          <Link
            to="/login"
            className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold px-6 py-2.5 rounded text-sm shadow inline-block"
          >
            Sign in to your account
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 flex-grow">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Shopping Cart</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => dispatch(clearCartError())}
              className="text-xs font-bold underline text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-1">Your cart is empty</h3>
            <p className="text-gray-500 text-xs mb-6">Explore our catalog and discover great deals.</p>
            <Link
              to="/products"
              className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold text-xs px-5 py-2.5 rounded shadow"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 bg-white border rounded-lg shadow-sm p-6 divide-y divide-gray-200">
              <div className="flex items-center justify-between pb-4">
                <h3 className="text-lg font-bold text-gray-900">Cart Items ({totalItems})</h3>
                <button
                  onClick={() => dispatch(clearCart())}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear All Items
                </button>
              </div>

              {items.map((item) => {
                const primaryImg =
                  item.product.images?.find((img) => img.isPrimary)?.imageUrl ||
                  item.product.images?.[0]?.imageUrl ||
                  'https://via.placeholder.com/150';

                const isAvailable = item.availableStock > 0;

                return (
                  <div key={item.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <Link to={`/products/${item.product.slug}`} className="w-20 h-20 border rounded p-1 flex-shrink-0 bg-gray-50">
                        <img src={primaryImg} alt={item.product.title} className="w-full h-full object-contain" />
                      </Link>

                      <div>
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-bold text-sm text-gray-900 hover:text-amazon-orange line-clamp-2"
                        >
                          {item.product.title}
                        </Link>
                        {item.variant && (
                          <p className="text-xs text-amazon-orange font-semibold mt-0.5">
                            Variant: {item.variant.variantName}
                          </p>
                        )}
                        <p className="text-[11px] text-gray-500 mt-1">
                          Brand: {item.product.brand || 'Generic'}
                        </p>

                        {/* Stock indicator */}
                        {isAvailable ? (
                          <span className="text-[11px] text-green-700 font-bold flex items-center space-x-1 mt-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>In Stock (Max: {item.availableStock})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-red-600 font-bold flex items-center space-x-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Out of Stock</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto space-x-6">
                      {/* Quantity Dropdown */}
                      <div className="flex items-center space-x-2 text-xs">
                        <label className="font-semibold text-gray-600">Qty:</label>
                        <select
                          value={item.quantity}
                          onChange={(e) =>
                            dispatch(
                              updateCartQuantity({
                                itemId: item.id,
                                quantity: parseInt(e.target.value, 10),
                              })
                            )
                          }
                          className="border rounded px-2 py-1 bg-white font-bold"
                        >
                          {[...Array(Math.min(10, item.availableStock))].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Item Price Subtotal */}
                      <div className="text-right">
                        <p className="font-extrabold text-base text-gray-900">${item.subtotal.toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500">${item.price.toFixed(2)} each</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => dispatch(removeFromCart(item.id))}
                        className="text-gray-400 hover:text-red-600 p-1.5 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Subtotal Summary Card (4 cols) */}
            <div className="lg:col-span-4 bg-white border rounded-lg shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-gray-900 border-b pb-3 text-base">Order Summary</h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({totalItems}):</span>
                  <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Shipping:</span>
                  <span className="font-bold text-green-700">{subtotal > 100 ? 'FREE' : '$10.00'}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between items-baseline">
                <span className="font-extrabold text-gray-900 text-sm">Subtotal:</span>
                <span className="font-black text-2xl text-gray-900">${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold text-xs py-3 rounded shadow transition flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="border-t pt-3 text-[11px] text-gray-500 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>100% Secure Checkout & Buyer Protection</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
