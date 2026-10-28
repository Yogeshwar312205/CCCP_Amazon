import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PayoutManagement = () => {
  const token = useSelector((state) => state.auth.token);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState(null);
  const [toast, setToast] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchPayouts = () => {
    setLoading(true);
    axios
      .get(`${API}/superadmin/payouts`, { headers })
      .then((r) => setPayouts(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPayouts, [token]);

  const release = async (shopId, shopName, amount) => {
    setReleasing(shopId);
    try {
      await axios.put(`${API}/superadmin/payouts/${shopId}/release`, {}, { headers });
      setToast(`$${parseFloat(amount).toFixed(2)} released to ${shopName}.`);
      setTimeout(() => setToast(null), 4000);
      fetchPayouts();
    } catch (err) {
      alert(err.response?.data?.message || 'Release failed.');
    } finally {
      setReleasing(null);
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Wallet className="w-7 h-7 text-amazon-orange" />
        Payout Ledger
      </h1>

      {toast && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-4">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          {toast}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amazon-orange" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No pending payouts.</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Shop</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Owner</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Available</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">In Escrow</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Total Orders</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payouts.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-bold text-gray-900">{shop.name}</td>
                  <td className="px-5 py-3 text-gray-600 text-xs">
                    {shop.owner?.firstName} {shop.owner?.lastName}<br />
                    <span className="text-gray-400">{shop.owner?.email}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-green-700">
                    ${parseFloat(shop.availableBalance).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right text-purple-600">
                    ${parseFloat(shop.escrowBalance).toFixed(2)}
                  </td>
                  <td className="px-5 py-3 text-right text-gray-600">{shop.totalOrders}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => release(shop.id, shop.name, shop.availableBalance)}
                      disabled={releasing === shop.id}
                      className="px-4 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
                    >
                      {releasing === shop.id ? 'Releasing...' : 'Release Payout'}
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

export default PayoutManagement;
