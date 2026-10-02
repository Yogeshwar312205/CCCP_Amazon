import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts } from '../../features/admin/adminSlice';
import { adminApi } from '../../services/adminApi';
import { fetchCategories } from '../../features/categories/categorySlice';
import {
  Package,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
} from 'lucide-react';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { products, productsPagination, productsLoading } = useSelector((state) => state.admin);
  const { categories } = useSelector((state) => state.categories);

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalFieldErrors, setModalFieldErrors] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    brand: '',
    categoryId: '',
    basePrice: '',
    salePrice: '',
    shortDescription: '',
    description: '',
  });

  const [variants, setVariants] = useState([
    { sku: '', variantName: 'Standard', price: '', stockQuantity: 10 },
  ]);

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    dispatch(fetchAdminProducts({ page, limit: 10, search: searchTerm }));
    dispatch(fetchCategories());
  }, [dispatch, page, searchTerm]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    dispatch(fetchAdminProducts({ page: 1, limit: 10, search: searchTerm }));
  };

  const handleToggleStatus = async (productId) => {
    try {
      await adminApi.toggleProductStatus(productId);
      dispatch(fetchAdminProducts({ page, limit: 10, search: searchTerm }));
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { sku: `${formData.sku || 'SKU'}-${variants.length + 1}`, variantName: '', price: formData.basePrice || '', stockQuantity: 10 },
    ]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');
    setModalFieldErrors([]);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('sku', formData.sku);
      data.append('brand', formData.brand);
      data.append('categoryId', parseInt(formData.categoryId, 10));
      data.append('basePrice', parseFloat(formData.basePrice));
      if (formData.salePrice) data.append('salePrice', parseFloat(formData.salePrice));
      data.append('shortDescription', formData.shortDescription);
      data.append('description', formData.description);

      // Add variants
      const formattedVariants = variants.map((v) => ({
        sku: v.sku,
        variantName: v.variantName,
        price: parseFloat(v.price),
        stockQuantity: parseInt(v.stockQuantity, 10) || 0,
      }));
      data.append('variants', JSON.stringify(formattedVariants));

      // Append files
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      await adminApi.createProduct(data);
      setShowAddModal(false);
      // Reset form
      setFormData({
        title: '',
        sku: '',
        brand: '',
        categoryId: '',
        basePrice: '',
        salePrice: '',
        shortDescription: '',
        description: '',
      });
      setVariants([{ sku: '', variantName: 'Standard', price: '', stockQuantity: 10 }]);
      setSelectedFiles([]);
      dispatch(fetchAdminProducts({ page: 1, limit: 10 }));
    } catch (err) {
      const responseData = err.response?.data;
      const fieldDetails = responseData?.error?.details;
      if (fieldDetails && fieldDetails.length > 0) {
        // Show per-field validation errors
        setModalFieldErrors(fieldDetails);
        setModalError('Please fix the following errors:');
      } else {
        setModalError(responseData?.message || responseData?.error?.message || 'Failed to create product');
        setModalFieldErrors([]);
      }
    } finally {
      setModalLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-amazon-orange" />
            Products Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create, update, and manage catalog items, variants, and pricing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md flex items-center gap-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, SKU, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-lg text-gray-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Variants</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productsLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange mx-auto"></div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const primaryImg = p.images?.find((img) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-50 border rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                          {primaryImg ? (
                            <img src={primaryImg} alt={p.title} className="object-contain max-h-full" />
                          ) : (
                            <Package className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-xs">{p.title}</div>
                          <div className="text-[11px] text-gray-400">{p.brand || 'No Brand'}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-600">{p.sku}</td>
                      <td className="px-5 py-3 text-gray-600">{p.category?.name || 'Unassigned'}</td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-gray-900">${parseFloat(p.basePrice).toFixed(2)}</div>
                        {p.salePrice && (
                          <div className="text-[10px] text-green-600 font-semibold">
                            Sale: ${parseFloat(p.salePrice).toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {p.variants?.length ? `${p.variants.length} variant(s)` : 'Base only'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleToggleStatus(p.id)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded border transition ${
                            p.isActive
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {p.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsPagination && productsPagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-xs text-gray-600">
            <div>
              Showing page <span className="font-bold">{productsPagination.page}</span> of{' '}
              <span className="font-bold">{productsPagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
              </button>
              <button
                disabled={page >= productsPagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 flex items-center"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto my-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product to Catalog</h2>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                <p className="font-semibold mb-1">{modalError}</p>
                {modalFieldErrors.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 mt-1">
                    {modalFieldErrors.map((err, i) => (
                      <li key={i}>
                        <span className="font-medium capitalize">
                          {err.field
                            .replace(/\./g, ' → ')
                            .replace(/([A-Z])/g, ' $1')
                            .trim()}
                          :
                        </span>{' '}
                        {err.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Ultra Wireless Noise Cancelling Headphones"
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g., HEADPHONE-BT-01"
                    className="w-full text-xs border rounded-lg p-2.5 uppercase focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., Sony, Apple, Bose"
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="199.99"
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sale Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    placeholder="Optional discount price"
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Key highlight or one-line pitch"
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, features, warranty..."
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                />
              </div>

              {/* Product Images Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs border rounded-lg p-2 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
                />
                <p className="text-[11px] text-gray-400 mt-1">Upload up to 5 JPEG/PNG images.</p>
              </div>

              {/* Product Variants Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-gray-900 uppercase">Product Variants & Stock</h3>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Variant
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border">
                      <input
                        type="text"
                        placeholder="Variant SKU"
                        required
                        value={v.sku}
                        onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                        className="w-1/4 text-xs border rounded p-1.5 bg-white uppercase"
                      />
                      <input
                        type="text"
                        placeholder="Variant Name (e.g., Midnight Black)"
                        required
                        value={v.variantName}
                        onChange={(e) => handleVariantChange(idx, 'variantName', e.target.value)}
                        className="w-1/3 text-xs border rounded p-1.5 bg-white"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        required
                        value={v.price}
                        onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                        className="w-1/5 text-xs border rounded p-1.5 bg-white"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        required
                        value={v.stockQuantity}
                        onChange={(e) => handleVariantChange(idx, 'stockQuantity', e.target.value)}
                        className="w-1/6 text-xs border rounded p-1.5 bg-white"
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold text-xs rounded-lg shadow"
                >
                  {modalLoading ? 'Saving Product...' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
