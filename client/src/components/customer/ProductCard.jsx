import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://via.placeholder.com/300?text=No+Image';

  const price = parseFloat(product.basePrice);
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null;

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between p-4 group">
      <div>
        {/* Product Image */}
        <Link to={`/products/${product.slug}`} className="block overflow-hidden relative mb-3">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-48 object-contain group-hover:scale-105 transition duration-300"
          />
          {product.isFeatured && (
            <span className="absolute top-2 left-2 bg-amazon-orange text-amazon-blue text-[10px] font-bold px-2 py-0.5 rounded shadow">
              Featured
            </span>
          )}
        </Link>

        {/* Brand & Category */}
        <p className="text-[10px] text-gray-400 uppercase font-semibold">
          {product.brand || product.category?.name}
        </p>

        {/* Title */}
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-semibold text-gray-900 hover:text-amazon-orange line-clamp-2 mb-2 block"
        >
          {product.title}
        </Link>

        {/* Rating Stars */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.averageRating || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">
            ({product.totalReviews || 0})
          </span>
        </div>
      </div>

      <div>
        {/* Pricing */}
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

        {/* Actions */}
        <Link
          to={`/products/${product.slug}`}
          className="w-full bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold py-2 rounded flex items-center justify-center space-x-1 shadow-sm transition"
        >
          <span>View Details</span>
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
