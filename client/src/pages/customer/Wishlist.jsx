import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/customer/Header';
import Navbar from '../../components/customer/Navbar';
import { fetchWishlist, removeFromWishlist } from '../../features/wishlist/wishlistSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { Heart, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items, loading, error } = useSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleMoveToCart = async (productId) => {
    await dispatch(addToCart({ productId, quantity: 1 }));
    await dispatch(removeFromWishlist(productId));
    navigate('/cart');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <Navbar />
        <main className="max-w-4xl mx-auto p-8 text-center my-12 bg-white border rounded-lg shadow-sm">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist</h2>
          <p className="text-gray-600 text-sm mb-6">Sign in to save and manage your favorite items.</p>
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
        <div className="flex items-center space-x-2 mb-6">
          <Heart className="w-7 h-7 text-red-500 fill-red-500" />
          <h1 className="text-2xl font-extrabold text-gray-900">Your Saved Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-gray-800 mb-1">Your Wishlist is empty</h3>
            <p className="text-gray-500 text-xs mb-6">Explore products and click the heart icon to save items for later.</p>
            <Link
              to="/products"
              className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold text-xs px-5 py-2.5 rounded shadow"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const primaryImg =
                item.product.images?.find((img) => img.isPrimary)?.imageUrl ||
                item.product.images?.[0]?.imageUrl ||
                'https://via.placeholder.com/300';

              const price = parseFloat(item.product.basePrice);
              const salePrice = item.product.salePrice ? parseFloat(item.product.salePrice) : null;

              return (
                <div key={item.id} className="bg-white border rounded-lg p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <Link to={`/products/${item.product.slug}`} className="block h-40 mb-3 bg-gray-50 p-2 rounded">
                      <img src={primaryImg} alt={item.product.title} className="w-full h-full object-contain" />
                    </Link>

                    <Link
                      to={`/products/${item.product.slug}`}
                      className="font-bold text-sm text-gray-900 hover:text-amazon-orange line-clamp-2 mb-2"
                    >
                      {item.product.title}
                    </Link>

                    <div className="flex items-baseline space-x-2 mb-3">
                      {salePrice ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">${salePrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-400 line-through">${price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">${price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t">
                    <button
                      onClick={() => handleMoveToCart(item.productId)}
                      className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold py-2 rounded flex items-center justify-center space-x-1 shadow-sm transition"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Move to Cart</span>
                    </button>

                    <button
                      onClick={() => dispatch(removeFromWishlist(item.productId))}
                      className="w-full text-xs text-red-600 hover:underline flex items-center justify-center space-x-1 py-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
