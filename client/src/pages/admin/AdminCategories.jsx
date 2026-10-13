import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import {
  FolderTree,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Layers,
  Package,
  AlertCircle,
  X,
} from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
    description: '',
    displayOrder: 0,
    isActive: true,
  });

  // Delete State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminApi.getCategories({ flat: true, search: searchTerm });
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      parentId: '',
      description: '',
      displayOrder: 0,
      isActive: true,
    });
    setModalError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || '',
      description: cat.description || '',
      displayOrder: cat.displayOrder || 0,
      isActive: cat.isActive,
    });
    setModalError('');
    setShowModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        parentId: formData.parentId ? parseInt(formData.parentId, 10) : null,
        description: formData.description.trim() || null,
        displayOrder: parseInt(formData.displayOrder, 10) || 0,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, payload);
        setActionMessage({ type: 'success', text: `Category "${payload.name}" updated successfully` });
      } else {
        await adminApi.createCategory(payload);
        setActionMessage({ type: 'success', text: `Category "${payload.name}" created successfully` });
      }

      setShowModal(false);
      loadCategories();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to save category'
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminApi.toggleCategoryStatus(id);
      loadCategories();
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to toggle status',
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await adminApi.deleteCategory(id);
      setDeleteConfirmId(null);
      setActionMessage({ type: 'success', text: 'Category deleted successfully' });
      loadCategories();
    } catch (err) {
      setDeleteConfirmId(null);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to delete category',
      });
    }
  };

  // Metrics
  const totalCategories = categories.length;
  const rootCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => c.parentId);
  const activeCategories = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-amazon-orange" />
            Categories Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Organize catalog categories and subcategories for customer browsing and product assignment.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold rounded-lg shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Notifications */}
      {actionMessage.text && (
        <div
          className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
            actionMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            onClick={() => setActionMessage({ type: '', text: '' })}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{totalCategories}</div>
            <div className="text-[11px] text-gray-500 font-medium">Total Categories</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{rootCategories.length}</div>
            <div className="text-[11px] text-gray-500 font-medium">Main Categories</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{subCategories.length}</div>
            <div className="text-[11px] text-gray-500 font-medium">Subcategories</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{activeCategories}</div>
            <div className="text-[11px] text-gray-500 font-medium">Active Status</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories by name or slug..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
          />
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading categories...</div>
        ) : error ? (
          <div className="p-8 text-center text-xs text-red-500">{error}</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-700">No categories found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Get started by creating categories so you can organize products and enable catalog browsing.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 px-4 py-2 bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold rounded-lg shadow-sm transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create First Category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Hierarchy / Parent</th>
                  <th className="py-3 px-4 text-center">Products</th>
                  <th className="py-3 px-4 text-center">Order</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">#{cat.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        {cat.parentId ? (
                          <span className="text-gray-400 font-mono text-sm pl-2">└</span>
                        ) : (
                          <FolderTree className="w-3.5 h-3.5 text-amazon-orange shrink-0" />
                        )}
                        <span>{cat.name}</span>
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-gray-500">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-4">
                      {cat.parent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                          Subcategory of {cat.parent.name}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          Main Category
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">
                        <Package className="w-3 h-3 text-gray-400" />
                        {cat.products ? cat.products.length : 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 font-medium">
                      {cat.displayOrder || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(cat.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                          cat.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3 text-green-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-gray-500" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(cat.id)}
                          title="Delete Category"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete Confirmation Popover */}
                      {deleteConfirmId === cat.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-left border">
                            <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-2">
                              <AlertCircle className="w-5 h-5 shrink-0" />
                              Confirm Delete Category
                            </div>
                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                              Are you sure you want to delete category <strong>"{cat.name}"</strong>? Categories with assigned products or subcategories cannot be deleted.
                            </p>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-3 py-1.5 text-xs text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-sm"
                              >
                                Yes, Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-amazon-orange" />
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electronics, Home & Kitchen, Shoes"
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Slug (URL identifier)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., electronics (leave empty to auto-generate)"
                  className="w-full text-xs border rounded-lg p-2.5 lowercase focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                />
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Leave blank to automatically generate from name
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Parent Category
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full text-xs border rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                >
                  <option value="">None (Top-Level Category)</option>
                  {rootCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <span className="text-[11px] text-gray-400 mt-0.5 block">
                  Select a parent to make this a nested subcategory
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items in this category..."
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-amazon-orange rounded border-gray-300 focus:ring-amazon-orange"
                    />
                    <span>Active Status</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 border rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {modalLoading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
