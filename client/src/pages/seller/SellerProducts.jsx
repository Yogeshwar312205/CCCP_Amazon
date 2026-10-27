import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Package, Plus, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const SellerProducts = () => {
  const token = useSelector((state) => state.auth.token);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(`${API}/seller/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setProducts(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProducts, [token]);

  const toggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await axios.patch(`${API}/seller/products/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-7 h-7 text-amazon-orange" />
          My Products
        </h1>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Boosted</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.title}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <span className="font-medium text-gray-900 max-w-[200px] truncate">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    ${parseFloat(product.salePrice || product.basePrice).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-semibold ${product.inventory?.stockQuantity <= (product.inventory?.lowStockThreshold || 5) ? 'text-red-600' : 'text-gray-700'}`}>
                      {product.inventory?.stockQuantity ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {product.isBoosted ? (
                      <span className="text-xs font-bold bg-amazon-yellow text-gray-900 px-2 py-0.5 rounded-full">
                        Sponsored
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(product.id)}
                      disabled={togglingId === product.id}
                      className="flex items-center justify-center mx-auto"
                      title={product.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {product.isActive ? (
                        <ToggleRight className="w-6 h-6 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
