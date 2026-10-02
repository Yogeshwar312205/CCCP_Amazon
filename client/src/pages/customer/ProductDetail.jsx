import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/customer/Header';
import Navbar from '../../components/customer/Navbar';
import ReviewCard from '../../components/customer/ReviewCard';
import ReviewForm from '../../components/customer/ReviewForm';
import QuestionSection from '../../components/customer/QuestionSection';
import RecentlyViewedSlider from '../../components/customer/RecentlyViewedSlider';
import { fetchProductBySlug } from '../../features/products/productSlice';
import { addToCart } from '../../features/cart/cartSlice';
import { addToWishlist } from '../../features/wishlist/wishlistSlice';
import { reviewApi } from '../../services/reviewApi';
import { userApi } from '../../services/userApi';
import { Star, ShieldCheck, Truck, RefreshCw, CheckCircle, AlertCircle, ShoppingCart, Heart } from 'lucide-react';

const ProductDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { selectedProduct, detailLoading, error } = useSelector((state) => state.products);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  const loadReviews = async (productId) => {
    try {
      const res = await reviewApi.getReviews(productId);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  useEffect(() => {
    dispatch(fetchProductBySlug(slug));
  }, [dispatch, slug]);

  useEffect(() => {
    if (selectedProduct) {
      const primaryImg =
        selectedProduct.images?.find((img) => img.isPrimary)?.imageUrl ||
        selectedProduct.images?.[0]?.imageUrl;
      setSelectedImage(primaryImg);

      if (selectedProduct.variants && selectedProduct.variants.length > 0) {
        setSelectedVariant(selectedProduct.variants[0]);
      }

      loadReviews(selectedProduct.id);

      // Track recently viewed product
      if (isAuthenticated) {
        userApi.trackRecentlyViewed(selectedProduct.id).catch(() => {});
      }
    }
  }, [selectedProduct, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const payload = {
      productId: selectedProduct.id,
      variantId: selectedVariant ? selectedVariant.id : null,
      quantity,
    };

    const result = await dispatch(addToCart(payload));
    if (addToCart.fulfilled.match(result)) {
      setAddedToCartSuccess(true);
      setTimeout(() => setAddedToCartSuccess(false), 3000);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await dispatch(addToWishlist(selectedProduct.id));
    navigate('/wishlist');
  };

  if (detailLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amazon-orange mx-auto"></div>
          <p className="text-sm text-gray-500 mt-4">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <Navbar />
        <div className="max-w-7xl mx-auto p-8 text-center bg-white rounded shadow border my-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
          <p className="text-gray-500 text-sm mt-1 mb-4">{error || 'The requested product is unavailable.'}</p>
          <Link to="/products" className="bg-amazon-yellow text-amazon-blue font-bold text-xs px-4 py-2 rounded">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const activePrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : selectedProduct.salePrice
    ? parseFloat(selectedProduct.salePrice)
    : parseFloat(selectedProduct.basePrice);

  const activeSku = selectedVariant ? selectedVariant.sku : selectedProduct.sku;

  const stockCount = selectedVariant
    ? selectedVariant.inventory?.stockQuantity ?? selectedVariant.stockQuantity
    : selectedProduct.inventory?.stockQuantity ?? 10;

  const isInStock = stockCount > 0;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 flex-grow">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 mb-4 flex items-center space-x-1">
          <Link to="/" className="hover:underline">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:underline">Products</Link>
          <span>/</span>
          {selectedProduct.category && (
            <>
              <Link to={`/products?category=${selectedProduct.category.slug}`} className="hover:underline">
                {selectedProduct.category.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-800 font-semibold truncate max-w-xs">{selectedProduct.title}</span>
        </div>

        {addedToCartSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Added to Cart successfully!</span>
            </div>
            <Link to="/cart" className="underline hover:text-green-900">
              View Cart & Checkout →
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Image Gallery (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full h-80 border rounded p-2 flex items-center justify-center bg-gray-50 mb-4">
              <img
                src={selectedImage || 'https://via.placeholder.com/400'}
                alt={selectedProduct.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnails */}
            {selectedProduct.images && selectedProduct.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto w-full pb-2">
                {selectedProduct.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className={`w-16 h-16 border rounded p-1 flex-shrink-0 ${
                      selectedImage === img.imageUrl ? 'border-amazon-orange ring-2 ring-amazon-orange' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.imageUrl} alt={img.altText || ''} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Middle Column: Product Details & Variants (4 cols) */}
          <div className="md:col-span-4 flex flex-col justify-between">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">{selectedProduct.brand}</p>
              <h1 className="text-xl font-bold text-gray-900 mt-1 mb-2">{selectedProduct.title}</h1>

              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(selectedProduct.averageRating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-blue-600 font-medium">
                  {selectedProduct.averageRating} ({selectedProduct.totalReviews} reviews)
                </span>
              </div>

              <div className="border-t border-b py-3 mb-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-2xl font-extrabold text-gray-900">
                    ${activePrice.toFixed(2)}
                  </span>
                  {selectedProduct.salePrice && !selectedVariant && (
                    <span className="text-sm text-gray-400 line-through">
                      ${parseFloat(selectedProduct.basePrice).toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  SKU: <code className="font-mono text-gray-700">{activeSku}</code>
                </p>
              </div>

              {/* Variant Selector */}
              {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Select Variant:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3 py-1.5 border text-xs rounded font-medium transition ${
                          selectedVariant?.id === v.id
                            ? 'border-amazon-orange bg-amber-50 text-amazon-orange font-bold ring-1 ring-amazon-orange'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {v.variantName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-600 leading-relaxed mb-4">{selectedProduct.shortDescription}</p>
            </div>

            {/* Specifications Table */}
            {selectedProduct.attributes && selectedProduct.attributes.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="font-bold text-xs text-gray-900 mb-2">Specifications</h4>
                <div className="bg-gray-50 rounded border divide-y divide-gray-200 text-xs">
                  {selectedProduct.attributes.map((attr) => (
                    <div key={attr.id} className="grid grid-cols-2 p-2">
                      <span className="font-semibold text-gray-600">{attr.attributeKey}</span>
                      <span className="text-gray-900">{attr.attributeValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Add to Cart Box (3 cols) */}
          <div className="md:col-span-3">
            <div className="border rounded-lg p-4 bg-gray-50 shadow-sm space-y-4">
              <div className="text-xl font-bold text-gray-900">${activePrice.toFixed(2)}</div>

              {isInStock ? (
                <div className="flex items-center space-x-1.5 text-green-700 text-sm font-bold">
                  <CheckCircle className="w-5 h-5" />
                  <span>{isLowStock ? `Only ${stockCount} left - order soon` : 'In Stock'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-red-600 text-sm font-bold">
                  <AlertCircle className="w-5 h-5" />
                  <span>Out of Stock</span>
                </div>
              )}

              {isInStock && (
                <div className="flex items-center space-x-2 text-xs">
                  <label className="font-bold text-gray-700">Quantity:</label>
                  <select
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                    className="border rounded p-1 bg-white"
                  >
                    {[...Array(Math.min(10, stockCount))].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold py-2.5 rounded shadow transition disabled:opacity-40 flex items-center justify-center space-x-1"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleAddToWishlist}
                className="w-full border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold py-2 rounded flex items-center justify-center space-x-1 transition"
              >
                <Heart className="w-4 h-4 text-red-500" />
                <span>Add to Wishlist</span>
              </button>

              <div className="border-t pt-3 text-[11px] text-gray-500 space-y-2">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-amazon-blue" />
                  <span>Ships from Amazon.clone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amazon-blue" />
                  <span>Secure Transaction</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h3 className="font-bold text-base text-gray-900 border-b pb-3 mb-6">Customer Reviews</h3>

          {isAuthenticated ? (
            <ReviewForm productId={selectedProduct.id} onReviewAdded={() => loadReviews(selectedProduct.id)} />
          ) : (
            <p className="text-xs text-gray-500 mb-6 italic">Please sign in to write a review.</p>
          )}

          {reviews.length === 0 ? (
            <p className="text-xs text-gray-500 italic">No customer reviews yet. Be the first to review this product!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <ReviewCard key={r.id} review={r} />
              ))}
            </div>
          )}
        </div>

        {/* Question & Answer Section */}
        <QuestionSection productId={selectedProduct.id} />

        {/* Recently Viewed Products Slider */}
        <RecentlyViewedSlider />
      </main>
    </div>
  );
};

export default ProductDetail;
