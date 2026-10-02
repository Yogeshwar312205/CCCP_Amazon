import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminCoupons } from '../../features/admin/adminSlice';
import { adminApi } from '../../services/adminApi';
import {
  Tag,
  Plus,
  CheckCircle,
  XCircle,
  Percent,
  DollarSign,
  Calendar,
} from 'lucide-react';

const AdminCoupons = () => {
  const dispatch = useDispatch();
  const { coupons, couponsLoading } = useSelector((state) => state.admin);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    dispatch(fetchAdminCoupons());
  }, [dispatch]);

  const handleToggleStatus = async (couponId) => {
    try {
      await adminApi.toggleCouponStatus(couponId);
      dispatch(fetchAdminCoupons());
    } catch (err) {
      console.error('Failed to toggle coupon status', err);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isActive: true,
      };

      await adminApi.createCoupon(payload);
      setShowCreateModal(false);
      setFormData({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minimumOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        startDate: '',
        endDate: '',
      });
      dispatch(fetchAdminCoupons());
    } catch (err) {
      setModalError(err.response?.data?.message || err.response?.data?.error?.message || 'Failed to create coupon');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-amazon-orange" />
            Coupons & Promotional Campaigns
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create discount codes, monitor redemption counts, and manage promotion limits.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs shadow transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b">
              <tr>
                <th className="px-5 py-3">Coupon Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Max Cap</th>
                <th className="px-5 py-3">Usage / Limit</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {couponsLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-orange mx-auto"></div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No active or past coupon campaigns found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono font-bold text-gray-900 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-amazon-orange" />
                      {c.code}
                    </td>
                    <td className="px-5 py-3 font-bold text-gray-800">
                      {c.discountType === 'PERCENTAGE'
                        ? `${parseFloat(c.discountValue)}% OFF`
                        : `$${parseFloat(c.discountValue).toFixed(2)} OFF`}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      ${parseFloat(c.minimumOrderAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.maxDiscountAmount ? `$${parseFloat(c.maxDiscountAmount).toFixed(2)}` : 'None'}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-gray-900">{c.usageCount}</span>
                      <span className="text-gray-400"> / {c.usageLimit || '∞'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(c.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded border transition ${
                          c.isActive
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-green-600 border-green-200 hover:bg-green-50'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Create Promotional Coupon</h2>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH30"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full text-xs uppercase font-mono border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 bg-white focus:ring-1 focus:ring-amazon-orange"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (%)</option>
                    <option value="FIXED_AMOUNT">FIXED AMOUNT ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15 for 15% or $15"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Minimum Order ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.minimumOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minimumOrderAmount: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Max Cap Discount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional max discount"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    placeholder="Unlimited if blank"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full text-xs border rounded-lg p-2.5 focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 bg-amazon-yellow hover:bg-yellow-400 disabled:opacity-50 text-gray-900 font-bold text-xs rounded-lg shadow"
                >
                  {modalLoading ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
