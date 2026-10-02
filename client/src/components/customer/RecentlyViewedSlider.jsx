import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { userApi } from '../../services/userApi';
import { Clock } from 'lucide-react';

const RecentlyViewedSlider = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      userApi
        .getRecentlyViewed()
        .then((res) => setRecentProducts(res.data.recentlyViewed))
        .catch((err) => console.error(err));
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || recentProducts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6 text-xs">
      <div className="flex items-center space-x-2 border-b pb-3 mb-4">
        <Clock className="w-5 h-5 text-amazon-orange" />
        <h3 className="font-bold text-base text-gray-900">Your Recently Viewed Products</h3>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {recentProducts.map((prod) => {
          const primaryImg =
            prod.images?.find((img) => img.isPrimary)?.imageUrl ||
            prod.images?.[0]?.imageUrl ||
            'https://via.placeholder.com/150';

          return (
            <Link
              key={prod.id}
              to={`/products/${prod.slug}`}
              className="w-36 flex-shrink-0 border rounded p-2 hover:shadow transition bg-gray-50 flex flex-col justify-between"
            >
              <div className="h-28 flex items-center justify-center mb-2">
                <img src={primaryImg} alt={prod.title} className="max-h-full max-w-full object-contain" />
              </div>
              <p className="font-bold text-gray-900 line-clamp-2 text-[11px] hover:text-amazon-orange">
                {prod.title}
              </p>
              <p className="font-extrabold text-amazon-blue mt-1">${parseFloat(prod.basePrice).toFixed(2)}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewedSlider;
