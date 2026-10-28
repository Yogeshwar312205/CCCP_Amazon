import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminScopeSelector from '../../components/admin/AdminScopeSelector';
import { useSearchParams } from 'react-router-dom';
import { fetchAdminInventory } from '../../features/admin/adminSlice';
import { adminApi } from '../../services/adminApi';
import {
  Boxes,
  AlertTriangle,
  Search,
  Plus,
  Minus,
  History,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const initialLowStock = searchParams.get('lowStock') === 'true';

  const { inventory, inventoryPagination, inventoryLoading } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStock);

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityChange, setQuantityChange] = useState(10);
  const [adjustType, setAdjustType] = useState('RESTOCK');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState('');

  // History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !selectedAdminId) return;
    dispatch(
      fetchAdminInventory({
        page,
        limit: 15,
        lowStockOnly,
        search: searchTerm,
        ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
      })
    );
  }, [dispatch, page, lowStockOnly, searchTerm, selectedAdminId, user?.role]);

  const handleOpenAdjustModal = (item) => {
    setSelectedItem(item);
    setQuantityChange(10);
    setAdjustType('RESTOCK');
    setAdjustNotes('');
    setAdjustError('');
    setShowAdjustModal(true);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setAdjustLoading(true);
    setAdjustError('');

    try {
      await adminApi.adjustStock(selectedItem.id, {
        quantityChange: parseInt(quantityChange, 10),
        type: adjustType,
        notes: adjustNotes,
      });

      setShowAdjustModal(false);
      dispatch(
        fetchAdminInventory({
          page,
          limit: 15,
          lowStockOnly,
          search: searchTerm,
          ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
        })
      );
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleOpenHistoryModal = async (item) => {
    setSelectedItem(item);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await adminApi.getInventoryHistory(item.id);
      setHistoryItems(res.data || []);
    } catch (err) {
      console.error('Failed to load inventory history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminScopeSelector selectedAdminId={selectedAdminId} onSelect={(id) => { setSelectedAdminId(id); setPage(1); }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-amazon-orange" />
            Inventory & Stock Engine
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time warehouse stock levels, low-inventory alerts, and restock auditing.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="w-3.5 h-3.5" /> Show Low Stock Only
            </span>
          </label>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b">
              <tr>
                <th className="px-5 py-3">Product / Variant</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Stock On Hand</th>
                <th className="px-5 py-3">Low Threshold</th>
                <th className="px-5 py-3">Health Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventoryLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange mx-auto"></div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">
                    No inventory records match criteria.
                  </td>
                </tr>
              ) : (
                inventory.map((inv) => {
                  const isLow = inv.stockQuantity <= inv.lowStockThreshold;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900">{inv.product?.title}</div>
                        {inv.variant && (
                          <div className="text-[11px] text-gray-500">Variant: {inv.variant.variantName}</div>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-gray-600">
                        {inv.variant?.sku || inv.product?.sku}
                      </td>
                      <td className="px-5 py-3 font-extrabold text-base text-gray-900">
                        {inv.stockQuantity}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{inv.lowStockThreshold} units</td>
                      <td className="px-5 py-3">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3" /> LOW STOCK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" /> IN STOCK
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right space-x-2">
                        <button
                          onClick={() => handleOpenHistoryModal(inv)}
                          className="text-xs font-semibold px-2 py-1 text-gray-600 hover:text-gray-900 border rounded hover:bg-gray-100 inline-flex items-center gap-1"
                          title="View Audit Trail"
                        >
                          <History className="w-3.5 h-3.5" /> History
                        </button>
                        <button
                          onClick={() => handleOpenAdjustModal(inv)}
                          className="text-xs font-semibold px-2.5 py-1 bg-amazon-yellow hover:bg-yellow-400 text-gray-900 rounded shadow-sm"
                        >
                          Adjust Stock
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
        {inventoryPagination && inventoryPagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-xs text-gray-600">
            <div>
              Page <span className="font-bold">{inventoryPagination.page}</span> of{' '}
              <span className="font-bold">{inventoryPagination.totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 flex items-center"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </button>
              <button
                disabled={page >= inventoryPagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 flex items-center"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Adjust Stock: {selectedItem.product?.title}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Current Stock: <span className="font-bold text-gray-800">{selectedItem.stockQuantity}</span>
            </p>

            {adjustError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                {adjustError}
              </div>
            )}

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Adjustment Type *
                </label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-amazon-orange"
                >
                  <option value="RESTOCK">RESTOCK (Warehouse Intake)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Cycle Count / Reconciliation)</option>
                  <option value="DAMAGE">DAMAGE (Scrapped / Broken)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Change (+ to add, - to deduct) *
                </label>
                <input
                  type="number"
                  required
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Audit Notes / PO Reference
                </label>
                <textarea
                  rows={2}
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g., PO #58921 inbound delivery from supplier"
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustLoading}
                  className="px-5 py-2 bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold text-xs rounded-lg shadow"
                >
                  {adjustLoading ? 'Saving...' : 'Apply Stock Change'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Audit Modal */}
      {showHistoryModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Inventory Transaction Log</h3>
                <p className="text-xs text-gray-500">{selectedItem.product?.title}</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amazon-orange mx-auto"></div>
              </div>
            ) : historyItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No transaction logs available.</p>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {historyItems.map((h) => (
                  <div key={h.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold ${
                            h.quantityChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {h.quantityChange > 0 ? `+${h.quantityChange}` : h.quantityChange}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded uppercase font-bold">
                          {h.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{h.notes}</div>
                    </div>
                    <div className="text-[10px] text-gray-400 text-right">
                      {new Date(h.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
