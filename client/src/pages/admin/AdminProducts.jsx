import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminProducts } from '../../features/admin/adminSlice';
import { adminApi } from '../../services/adminApi';
import { fetchCategories } from '../../features/categories/categorySlice';
import AdminScopeSelector from '../../components/admin/AdminScopeSelector';
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
  FolderPlus,
  FolderTree,
  X,
} from 'lucide-react';

const AdminProducts = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, productsPagination, productsLoading } = useSelector((state) => state.admin);
  const { categories } = useSelector((state) => state.categories);

  const [page, setPage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFiles, setEditFiles] = useState([]);
  const [editFilePreviews, setEditFilePreviews] = useState([]);
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

  // Quick Category Creation State
  const [showQuickCategoryModal, setShowQuickCategoryModal] = useState(false);
  const [quickCategoryLoading, setQuickCategoryLoading] = useState(false);
  const [quickCategoryError, setQuickCategoryError] = useState('');
  const [quickCategoryData, setQuickCategoryData] = useState({
    name: '',
    parentId: '',
    description: '',
  });

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !selectedAdminId) return;
    dispatch(fetchAdminProducts({
      page,
      limit: 10,
      search: searchTerm,
      ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
    }));
    dispatch(fetchCategories({ flat: true }));
  }, [dispatch, page, searchTerm, selectedAdminId, user?.role]);

  const handleQuickCreateCategory = async (e) => {
    e.preventDefault();
    setQuickCategoryLoading(true);
    setQuickCategoryError('');

    try {
      const payload = {
        name: quickCategoryData.name.trim(),
        parentId: quickCategoryData.parentId ? parseInt(quickCategoryData.parentId, 10) : null,
        description: quickCategoryData.description.trim() || null,
        isActive: true,
      };

      const res = await adminApi.createCategory(payload);
      const newCat = res.data;

      // Refresh categories in redux
      await dispatch(fetchCategories({ flat: true }));

      // Automatically select newly created category in product form
      setFormData((prev) => ({ ...prev, categoryId: newCat.id.toString() }));

      // Reset and close quick modal
      setQuickCategoryData({ name: '', parentId: '', description: '' });
      setShowQuickCategoryModal(false);
    } catch (err) {
      setQuickCategoryError(
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to create category'
      );
    } finally {
      setQuickCategoryLoading(false);
    }
  };

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

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditData({
      title: product.title || '',
      sku: product.sku || '',
      brand: product.brand || '',
      categoryId: product.categoryId || product.category?.id || '',
      basePrice: product.basePrice ?? '',
      salePrice: product.salePrice ?? '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(product.isActive),
    });
    setEditFiles([]);
    setEditFilePreviews([]);
    setEditError('');
  };

  useEffect(() => {
    const previews = editFiles.map((file) => URL.createObjectURL(file));
    setEditFilePreviews(previews);
    return () => previews.forEach((preview) => URL.revokeObjectURL(preview));
  }, [editFiles]);

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    setEditLoading(true);
    setEditError('');

    try {
      const updatePayload = {
        title: editData.title.trim(),
        sku: editData.sku.trim(),
        brand: editData.brand.trim() || undefined,
        categoryId: parseInt(editData.categoryId, 10),
        basePrice: parseFloat(editData.basePrice),
        salePrice: editData.salePrice === '' ? null : parseFloat(editData.salePrice),
        shortDescription: editData.shortDescription.trim() || undefined,
        description: editData.description.trim(),
        isFeatured: editData.isFeatured,
        isActive: editData.isActive,
      };
      if (editFiles.length > 0) {
        const formDataPayload = new FormData();
        Object.entries(updatePayload).forEach(([key, value]) => {
          if (value !== undefined) formDataPayload.append(key, value);
        });
        editFiles.forEach((file) => formDataPayload.append('images', file));
        await adminApi.updateProduct(editingProduct.id, formDataPayload);
      } else {
        await adminApi.updateProduct(editingProduct.id, updatePayload);
      }
      setEditingProduct(null);
      await dispatch(fetchAdminProducts({ page, limit: 10, search: searchTerm })).unwrap();
    } catch (err) {
      setEditError(
        err.response?.data?.message || err.response?.data?.error?.message || 'Failed to update product'
      );
    } finally {
      setEditLoading(false);
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
      if (user?.role === 'SUPER_ADMIN' && selectedAdminId) {
        data.append('adminId', selectedAdminId);
      }

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
      <AdminScopeSelector selectedAdminId={selectedAdminId} onSelect={(id) => { setSelectedAdminId(id); setPage(1); }} />
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
                            <img
                              src={primaryImg}
                              alt={p.title}
                              className="object-contain max-h-full"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
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
                          onClick={() => handleOpenEdit(p)}
                          className="text-xs font-semibold px-2.5 py-1 rounded border text-blue-600 border-blue-200 hover:bg-blue-50 transition mr-2"
                        >
                          Edit
                        </button>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">Category *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setQuickCategoryError('');
                        setQuickCategoryData({ name: '', parentId: '', description: '' });
                        setShowQuickCategoryModal(true);
                      }}
                      className="text-[11px] font-bold text-amazon-orange hover:text-amber-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Category
                    </button>
                  </div>

                  {categories.length === 0 ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
                      <span>No categories found.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setQuickCategoryError('');
                          setQuickCategoryData({ name: '', parentId: '', description: '' });
                          setShowQuickCategoryModal(true);
                        }}
                        className="font-bold underline text-amber-900 ml-2"
                      >
                        + Create Category
                      </button>
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full text-xs border rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.parent ? `↳ ${c.name} (${c.parent.name})` : c.name}
                        </option>
                      ))}
                    </select>
                  )}
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

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {editError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">{editError}</div>}
            <form onSubmit={handleEditProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                ['title', 'Product Title', 'text'],
                ['sku', 'SKU', 'text'],
                ['brand', 'Brand', 'text'],
                ['basePrice', 'Base Price', 'number'],
                ['salePrice', 'Sale Price', 'number'],
              ].map(([field, label, type]) => (
                <label key={field} className="block font-semibold text-gray-700">
                  {label}
                  <input
                    type={type}
                    step={type === 'number' ? '0.01' : undefined}
                    value={editData[field]}
                    onChange={(e) => setEditData({ ...editData, [field]: e.target.value })}
                    required={field !== 'brand' && field !== 'salePrice'}
                    className="w-full mt-1 border rounded-lg p-2.5 font-normal"
                  />
                </label>
              ))}
              <label className="block font-semibold text-gray-700">
                Category
                <select
                  required
                  value={editData.categoryId}
                  onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                  className="w-full mt-1 border rounded-lg p-2.5 bg-white font-normal"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <label className="block font-semibold text-gray-700 sm:col-span-2">
                Short Description
                <input
                  value={editData.shortDescription}
                  onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                  className="w-full mt-1 border rounded-lg p-2.5 font-normal"
                />
              </label>
              <label className="block font-semibold text-gray-700 sm:col-span-2">
                Description
                <textarea
                  required
                  rows={4}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full mt-1 border rounded-lg p-2.5 font-normal resize-none"
                />
              </label>
              <label className="block font-semibold text-gray-700 sm:col-span-2">
                Product Images
                {editingProduct.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {editingProduct.images.map((image) => (
                      <div key={image.id} className="w-20 h-20 border rounded-lg bg-gray-50 p-1">
                        <img
                          src={image.imageUrl}
                          alt={image.altText || editingProduct.title}
                          className="w-full h-full object-contain"
                          onError={(event) => {
                            event.currentTarget.alt = 'Image unavailable';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => setEditFiles(Array.from(e.target.files || []))}
                  className="w-full mt-1 border rounded-lg p-2.5 font-normal"
                />
                <span className="block mt-1 text-[11px] font-normal text-gray-500">
                  Select up to 5 images to replace the current gallery. Leave empty to keep existing images.
                </span>
                {editFiles.length > 0 && (
                  <>
                    <span className="block mt-1 text-[11px] font-normal text-blue-600">
                      {editFiles.length} new image{editFiles.length === 1 ? '' : 's'} selected. These will replace the current gallery.
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editFilePreviews.map((preview, index) => (
                        <div key={preview} className="w-20 h-20 border rounded-lg bg-gray-50 p-1">
                          <img src={preview} alt={`Selected product image ${index + 1}`} className="w-full h-full object-contain" />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </label>
              <div className="sm:col-span-2 flex gap-5">
                <label className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" checked={editData.isFeatured} onChange={(e) => setEditData({ ...editData, isFeatured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2 font-semibold">
                  <input type="checkbox" checked={editData.isActive} onChange={(e) => setEditData({ ...editData, isActive: e.target.checked })} />
                  Active
                </label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 border rounded-lg font-semibold">Cancel</button>
                <button type="submit" disabled={editLoading} className="px-4 py-2 bg-amazon-yellow rounded-lg font-bold disabled:opacity-50">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Category Modal */}
      {showQuickCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 border border-gray-100">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-amazon-orange" />
                Add New Category
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {quickCategoryError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-lg mb-3">
                {quickCategoryError}
              </div>
            )}

            <form onSubmit={handleQuickCreateCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={quickCategoryData.name}
                  onChange={(e) => setQuickCategoryData({ ...quickCategoryData, name: e.target.value })}
                  placeholder="e.g., Electronics, Audio, Apparel"
                  className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Parent Category (Optional)
                </label>
                <select
                  value={quickCategoryData.parentId}
                  onChange={(e) => setQuickCategoryData({ ...quickCategoryData, parentId: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2 bg-white focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c) => !c.parentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={quickCategoryData.description}
                  onChange={(e) => setQuickCategoryData({ ...quickCategoryData, description: e.target.value })}
                  placeholder="Short category description..."
                  className="w-full text-xs border rounded-lg p-2 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowQuickCategoryModal(false)}
                  disabled={quickCategoryLoading}
                  className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickCategoryLoading}
                  className="px-4 py-1.5 bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {quickCategoryLoading ? 'Creating...' : 'Save & Select'}
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
