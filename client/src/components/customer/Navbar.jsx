import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { setFilter, fetchProducts } from '../../features/products/productSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories } = useSelector((state) => state.categories);

  const handleCategoryClick = (categorySlug) => {
    dispatch(setFilter({ category: categorySlug }));
    dispatch(fetchProducts({ category: categorySlug, page: 1 }));
    navigate('/products');
  };

  return (
    <nav className="bg-amazon-light_blue text-white text-xs px-4 py-2 flex items-center space-x-6 overflow-x-auto shadow">
      <button
        onClick={() => handleCategoryClick('')}
        className="flex items-center space-x-1 font-bold hover:text-amazon-yellow flex-shrink-0"
      >
        <Menu className="w-4 h-4" />
        <span>All Products</span>
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleCategoryClick(cat.slug)}
          className="hover:text-amazon-yellow flex-shrink-0 whitespace-nowrap"
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
};

export default Navbar;
