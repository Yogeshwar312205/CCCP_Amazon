import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/customer/Header';
import Navbar from '../../components/customer/Navbar';
import FilterSidebar from '../../components/customer/FilterSidebar';
import ProductCard from '../../components/customer/ProductCard';
import Pagination from '../../components/customer/Pagination';
import { fetchProducts, setFilter, setPage } from '../../features/products/productSlice';
import { Package, SlidersHorizontal } from 'lucide-react';

const ProductList = () => {
  const dispatch = useDispatch();
  const { items, pagination, filters, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters.sort]);

  const handleSortChange = (e) => {
    const sort = e.target.value;
    dispatch(setFilter({ sort }));
    dispatch(fetchProducts({ ...filters, sort, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
    dispatch(fetchProducts({ ...filters, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-4 flex-grow">
        {/* Results Bar */}
        <div className="bg-white p-3 rounded shadow-sm border mb-4 flex items-center justify-between text-xs">
          <p className="text-gray-600 font-medium">
            Showing <strong className="text-gray-900">{items.length}</strong> of{' '}
            <strong className="text-gray-900">{pagination.total}</strong> results
            {filters.search && <span> for "<strong className="text-amazon-orange">{filters.search}</strong>"</span>}
          </p>

          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <label className="font-bold text-gray-700">Sort by:</label>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="border rounded px-2 py-1 bg-gray-50 text-gray-800 focus:outline-none"
            >
              <option value="newest">Featured & Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filter Sidebar */}
          <FilterSidebar />

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border rounded p-4 h-72 animate-pulse flex flex-col justify-between">
                    <div className="bg-gray-200 h-40 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="bg-gray-200 h-4 rounded w-3/4"></div>
                      <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded text-center">
                <p className="font-bold">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white border rounded-lg p-12 text-center shadow-sm">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-800">No products found</h3>
                <p className="text-gray-500 text-xs mt-1">Try clearing filters or searching for another keyword.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  page={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductList;
