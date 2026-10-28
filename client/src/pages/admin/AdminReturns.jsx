import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminScopeSelector from '../../components/admin/AdminScopeSelector';
import { fetchAdminReturns } from '../../features/admin/adminSlice';
import { adminApi } from '../../services/adminApi';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

const AdminReturns = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { returns, returnsPagination, returnsLoading } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [selectedAdminId, setSelectedAdminId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Process Modal
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [adminNotes, setAdminNotes] = useState('');
  const [processLoading, setProcessLoading] = useState(false);
  const [processError, setProcessError] = useState('');

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN' && !selectedAdminId) return;
    dispatch(
      fetchAdminReturns({
        page,
        limit: 15,
        status: selectedStatus,
        ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
      })
    );
  }, [dispatch, page, selectedStatus, selectedAdminId, user?.role]);

  const handleOpenProcessModal = (ret, action) => {
    setSelectedReturn(ret);
    setActionType(action);
    setAdminNotes('');
    setProcessError('');
    setShowProcessModal(true);
  };

  const handleProcessReturn = async (e) => {
    e.preventDefault();
    if (!selectedReturn) return;
    setProcessLoading(true);
    setProcessError('');

    try {
      await adminApi.processReturn(selectedReturn.id, {
        action: actionType,
        adminNotes,
      });

      setShowProcessModal(false);
      dispatch(
        fetchAdminReturns({
          page,
          limit: 15,
          status: selectedStatus,
          ...(user?.role === 'SUPER_ADMIN' ? { adminId: selectedAdminId } : {}),
        })
      );
    } catch (err) {
      setProcessError(err.response?.data?.message || 'Failed to process return');
    } finally {
      setProcessLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">REFUND COMPLETED</span>;
      case 'ITEM_RECEIVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">ITEM RECEIVED</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">APPROVED</span>;
      case 'REQUESTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">UNDER REVIEW</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">REJECTED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <AdminScopeSelector selectedAdminId={selectedAdminId} onSelect={(id) => { setSelectedAdminId(id); setPage(1); }} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-amazon-orange" />
            Returns & Refund Processing
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Review customer return requests, inspect returns, and execute automated refunds.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs border rounded-lg px-3 py-2 bg-white focus:ring-1 focus:ring-amazon-orange"
          >
            <option value="">All Return Statuses</option>
            <option value="REQUESTED">REQUESTED (Needs Review)</option>
            <option value="APPROVED">APPROVED (Awaiting Shipment)</option>
            <option value="ITEM_RECEIVED">ITEM RECEIVED</option>
            <option value="COMPLETED">COMPLETED (Refunded)</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b">
              <tr>
                <th className="px-5 py-3">Return #</th>
                <th className="px-5 py-3">Order Number</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Reason & Details</th>
                <th className="px-5 py-3">Order Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {returnsLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange mx-auto"></div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No return requests found.
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-bold text-gray-900">#{ret.id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">
                      {ret.order?.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {ret.user ? `${ret.user.firstName} ${ret.user.lastName}` : 'Guest'}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      <div className="font-semibold text-gray-900">{ret.reason}</div>
                      {ret.details && (
                        <div className="text-[11px] text-gray-500 truncate mt-0.5">{ret.details}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-900">
                      ${ret.order ? parseFloat(ret.order.totalAmount).toFixed(2) : '0.00'}
                    </td>
                    <td className="px-5 py-3">{getStatusBadge(ret.status)}</td>
                    <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                      {ret.status === 'REQUESTED' && (
                        <>
                          <button
                            onClick={() => handleOpenProcessModal(ret, 'APPROVE')}
                            className="px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleOpenProcessModal(ret, 'REJECT')}
                            className="px-2 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {ret.status === 'APPROVED' && (
                        <button
                          onClick={() => handleOpenProcessModal(ret, 'RECEIVE')}
                          className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 rounded"
                        >
                          Mark Received
                        </button>
                      )}

                      {ret.status === 'ITEM_RECEIVED' && (
                        <button
                          onClick={() => handleOpenProcessModal(ret, 'COMPLETE_REFUND')}
                          className="px-2.5 py-1 text-xs font-bold bg-amazon-yellow text-gray-900 hover:bg-yellow-400 rounded shadow-sm"
                        >
                          Issue Refund
                        </button>
                      )}

                      {ret.status === 'COMPLETED' && (
                        <span className="text-[11px] text-gray-400 font-semibold">Refunded</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {returnsPagination && returnsPagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between text-xs text-gray-600">
            <div>
              Page <span className="font-bold">{returnsPagination.page}</span> of{' '}
              <span className="font-bold">{returnsPagination.totalPages}</span>
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
                disabled={page >= returnsPagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-50 flex items-center"
              >
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Return Action Modal */}
      {showProcessModal && selectedReturn && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {actionType === 'APPROVE' && 'Approve Return Request'}
              {actionType === 'REJECT' && 'Reject Return Request'}
              {actionType === 'RECEIVE' && 'Confirm Item Received at Warehouse'}
              {actionType === 'COMPLETE_REFUND' && 'Execute Refund for Order'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Return #{selectedReturn.id} (Order #{selectedReturn.order?.orderNumber})
            </p>

            {processError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                {processError}
              </div>
            )}

            <form onSubmit={handleProcessReturn} className="space-y-4">
              {actionType === 'COMPLETE_REFUND' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                  ⚠️ This will mark order #{selectedReturn.order?.orderNumber} as RETURNED, set payment
                  status to REFUNDED, and record an authoritative refund entry of $
                  {parseFloat(selectedReturn.order?.totalAmount).toFixed(2)}.
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Admin Notes / Customer Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g., Package inspected, serial numbers verified"
                  className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processLoading}
                  className="px-5 py-2 bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold text-xs rounded-lg shadow"
                >
                  {processLoading ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReturns;
