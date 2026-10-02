import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, resetFilters, fetchProducts } from '../../features/products/productSlice';
import { Star, RotateCcw } from 'lucide-react';

const FilterSidebar = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.categories);
  const { availableBrands, filters } = useSelector((state) => state.products);

  const [minPrice, setMinPrice] = useState(filters.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '');

  const applyPriceFilter = (e) => {
    e.preventDefault();
    const updated = { minPrice, maxPrice };
    dispatch(setFilter(updated));
    dispatch(fetchProducts({ ...filters, ...updated, page: 1 }));
  };

  const handleCategorySelect = (slug) => {
    const updated = { category: filters.category === slug ? '' : slug };
    dispatch(setFilter(updated));
    dispatch(fetchProducts({ ...filters, ...updated, page: 1 }));
  };

  const handleBrandToggle = (brandName) => {
    let currentBrands = filters.brand ? filters.brand.split(',') : [];
    if (currentBrands.includes(brandName)) {
      currentBrands = currentBrands.filter((b) => b !== brandName);
    } else {
      currentBrands.push(brandName);
    }
    const updated = { brand: currentBrands.join(',') };
    dispatch(setFilter(updated));
    dispatch(fetchProducts({ ...filters, ...updated, page: 1 }));
  };

  const handleRatingSelect = (rating) => {
    const updated = { minRating: filters.minRating === rating ? '' : rating };
    dispatch(setFilter(updated));
    dispatch(fetchProducts({ ...filters, ...updated, page: 1 }));
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    dispatch(resetFilters());
    dispatch(fetchProducts({ page: 1 }));
  };

  return (
    <aside className="w-64 bg-white p-4 rounded shadow-sm border border-gray-200 text-xs space-y-6 flex-shrink-0">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        <button
          onClick={handleReset}
          className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category Tree */}
      <div>
        <h4 className="font-bold text-gray-800 mb-2">Categories</h4>
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleCategorySelect(cat.slug)}
                className={`text-left w-full hover:text-amazon-orange ${
                  filters.category === cat.slug ? 'font-bold text-amazon-orange' : 'text-gray-700'
                }`}
              >
                {cat.name}
              </button>
              {cat.subcategories && cat.subcategories.length > 0 && (
                <ul className="pl-3 mt-1 space-y-1">
                  {cat.subcategories.map((sub) => (
                    <li key={sub.id}>
                      <button
                        onClick={() => handleCategorySelect(sub.slug)}
                        className={`text-left w-full hover:text-amazon-orange text-[11px] ${
                          filters.category === sub.slug ? 'font-bold text-amazon-orange' : 'text-gray-600'
                        }`}
                      >
                        • {sub.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Price Filter */}
      <div className="border-t pt-4">
        <h4 className="font-bold text-gray-800 mb-2">Price Range</h4>
        <form onSubmit={applyPriceFilter} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="$ Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-1/2 p-1 border rounded text-xs"
            />
            <span>-</span>
            <input
              type="number"
              placeholder="$ Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-1/2 p-1 border rounded text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gray-200 hover:bg-gray-300 py-1 rounded font-medium text-gray-800"
          >
            Go
          </button>
        </form>
      </div>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-bold text-gray-800 mb-2">Brands</h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {availableBrands.map((b) => {
              const selectedBrands = filters.brand ? filters.brand.split(',') : [];
              return (
                <label key={b} className="flex items-center space-x-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b)}
                    onChange={() => handleBrandToggle(b)}
                    className="rounded text-amazon-orange focus:ring-amazon-orange"
                  />
                  <span>{b}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="border-t pt-4">
        <h4 className="font-bold text-gray-800 mb-2">Customer Review</h4>
        <div className="space-y-1">
          {[4, 3, 2, 1].map((stars) => (
            <button
              key={stars}
              onClick={() => handleRatingSelect(stars)}
              className={`flex items-center space-x-1 w-full text-left p-1 rounded hover:bg-gray-50 ${
                filters.minRating === stars ? 'bg-amber-50 font-bold' : ''
              }`}
            >
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < stars ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-gray-600 text-[11px]">& Up</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
