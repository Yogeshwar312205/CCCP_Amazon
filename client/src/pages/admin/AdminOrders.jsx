import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminScopeSelector from '../../components/admin/AdminScopeSelector';
import { fetchAdminOrders } from '../../features/admin/adminSlice';
import { adminApi } from '../../services/adminApi';
import {
  ShoppingBag,
  Search,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { orders, ordersPagination, ordersLoading } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Status Update Modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !selectedAdminId) return;
    dispatch(
      fetchAdminOrders({
        page,
        limit: 10,
        status: selectedStatus,
        search: searchTerm,
        ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
      })
    );
  }, [dispatch, page, selectedStatus, searchTerm, selectedAdminId, user?.role]);

  const handleOpenStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setCarrier(order.carrier || 'FedEx');
    setTrackingNumber(order.trackingNumber || '');
    setUpdateError('');
    setShowStatusModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setUpdateLoading(true);
    setUpdateError('');

    try {
      await adminApi.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        carrier: newStatus === 'SHIPPED' ? carrier : undefined,
        trackingNumber: newStatus === 'SHIPPED' ? trackingNumber : undefined,
      });

      setShowStatusModal(false);
      dispatch(
        fetchAdminOrders({
          page,
          limit: 10,
          status: selectedStatus,
          search: searchTerm,
          ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
        })
      );
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">DELIVERED</span>;
      case 'SHIPPED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">SHIPPED</span>;
      case 'PROCESSING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">PROCESSING</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">PENDING</span>;
      case 'CANCELLED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">CANCELLED</span>;
      case 'RETURNED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">RETURNED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminScopeSelector selectedAdminId={selectedAdminId} onSelect={(id) => { setSelectedAdminId(id); setPage(1); }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-amazon-orange" />
            Orders & Fulfillment
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track customer orders, manage parcel dispatch, and assign tracking carriers.
          </p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order or tracking #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-amazon-orange focus:border-amazon-orange"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-amazon-orange"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total Amount</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Tracking</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ordersLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange mx-auto"></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-bold text-gray-900">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Guest'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {o.items?.length || 0} item(s)
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900">
                      ${parseFloat(o.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(o.placedAt || o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(o.status)}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-[11px]">
                      {o.trackingNumber ? (
                        <span>
                          {o.carrier}: {o.trackingNumber}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Shipped</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(o)}
                        className="text-xs font-semibold px-2.5 py-1 bg-amazon-yellow hover:bg-yellow-400 text-gray-900 rounded shadow-sm transition"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {ordersPagination && ordersPagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-xs text-gray-600">
            <div>
              Page <span className="font-bold">{ordersPagination.page}</span> of{' '}
              <span className="font-bold">{ordersPagination.totalPages}</span>
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
                disabled={page >= ordersPagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 flex items-center"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Status & Fulfillment Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Fulfill / Update Order #{selectedOrder.orderNumber}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Current status: <span className="font-semibold">{selectedOrder.status}</span>
            </p>

            {updateError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                {updateError}
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Change Status To *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-xs border rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-amazon-orange"
                >
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED (Auto-Restock & Refund)</option>
                </select>
              </div>

              {newStatus === 'SHIPPED' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Courier / Carrier *
                    </label>
                    <input
                      type="text"
                      required
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g., FedEx, UPS, DHL, BlueDart"
                      className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tracking Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g., FDX-982148102"
                      className="w-full text-xs border rounded-lg p-2.5 font-mono uppercase focus:ring-1 focus:ring-amazon-orange"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2 bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold text-xs rounded-lg shadow"
                >
                  {updateLoading ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
