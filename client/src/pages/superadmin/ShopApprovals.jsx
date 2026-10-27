import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Store, CheckCircle, XCircle, PauseCircle, ChevronDown, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-gray-100 text-gray-600',
};

const ShopApprovals = () => {
  const token = useSelector((state) => state.auth.token);
  const [shops, setShops] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectInputs, setRejectInputs] = useState({});
  const [suspendInputs, setSuspendInputs] = useState({});

  const headers = { Authorization: `Bearer ${token}` };

  const fetchShops = () => {
    setLoading(true);
    axios
      .get(`${API}/superadmin/shops`, { headers, params: { status: statusFilter } })
      .then((r) => setShops(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchShops, [token, statusFilter]);

  const action = async (id, endpoint, body = {}) => {
    setActionLoading(id);
    try {
      await axios.put(`${API}/superadmin/shops/${id}/${endpoint}`, body, { headers });
      fetchShops();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="w-7 h-7 text-amazon-orange" />
          Shop Approvals (KYC)
        </h1>
        <div className="flex gap-2">
          {['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                statusFilter === s
                  ? 'bg-amazon-orange text-white border-amazon-orange'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-amazon-orange'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amazon-orange" />
        </div>
      ) : shops.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No {statusFilter.toLowerCase()} shops.</div>
      ) : (
        <div className="space-y-4">
          {shops.map((shop) => (
            <div key={shop.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{shop.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[shop.status]}`}>
                      {shop.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Owner: {shop.owner?.firstName} {shop.owner?.lastName} · {shop.owner?.email}
                  </p>
                  {shop.businessRegNo && (
                    <p className="text-xs text-gray-500">Reg: {shop.businessRegNo}</p>
                  )}
                  {shop.taxId && (
                    <p className="text-xs text-gray-500">Tax ID: {shop.taxId}</p>
                  )}
                  {shop.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {shop.rejectionReason}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 items-start">
                  {shop.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => action(shop.id, 'approve')}
                        disabled={actionLoading === shop.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          placeholder="Rejection reason..."
                          value={rejectInputs[shop.id] || ''}
                          onChange={(e) => setRejectInputs((p) => ({ ...p, [shop.id]: e.target.value }))}
                          className="border border-gray-300 rounded-l-lg text-xs px-2 py-1.5 w-40 focus:outline-none focus:ring-1 focus:ring-red-400"
                        />
                        <button
                          onClick={() => action(shop.id, 'reject', { reason: rejectInputs[shop.id] })}
                          disabled={actionLoading === shop.id}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-r-lg hover:bg-red-700 disabled:opacity-60 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </>
                  )}
                  {shop.status === 'ACTIVE' && (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Suspension reason..."
                        value={suspendInputs[shop.id] || ''}
                        onChange={(e) => setSuspendInputs((p) => ({ ...p, [shop.id]: e.target.value }))}
                        className="border border-gray-300 rounded-l-lg text-xs px-2 py-1.5 w-44 focus:outline-none focus:ring-1 focus:ring-orange-400"
                      />
                      <button
                        onClick={() => action(shop.id, 'suspend', { reason: suspendInputs[shop.id] })}
                        disabled={actionLoading === shop.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-r-lg hover:bg-orange-700 disabled:opacity-60 transition"
                      >
                        <PauseCircle className="w-3.5 h-3.5" /> Suspend
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopApprovals;
