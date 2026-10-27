import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Zap, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const BoostManagement = () => {
  const token = useSelector((state) => state.auth.token);
  const [boosts, setBoosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('REQUESTED');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [durationInputs, setDurationInputs] = useState({});
  const [rejectReasons, setRejectReasons] = useState({});

  const headers = { Authorization: `Bearer ${token}` };

  const fetchBoosts = () => {
    setLoading(true);
    axios
      .get(`${API}/superadmin/boosts`, { headers, params: { status: statusFilter === 'ALL' ? 'ALL' : statusFilter } })
      .then((r) => setBoosts(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBoosts, [token, statusFilter]);

  const approve = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${API}/superadmin/boosts/${id}/approve`, { durationDays: durationInputs[id] || 7 }, { headers });
      fetchBoosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve.');
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${API}/superadmin/boosts/${id}/reject`, { reason: rejectReasons[id] || '' }, { headers });
      fetchBoosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-7 h-7 text-amazon-orange" />
          Boost Campaigns
        </h1>
        <div className="flex gap-2">
          {['REQUESTED', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
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
      ) : boosts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} boost campaigns.</div>
      ) : (
        <div className="space-y-4">
          {boosts.map((b) => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-gray-900">{b.product?.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Shop: <span className="font-semibold">{b.shop?.name}</span> ·
                    Rating: <span className={b.shop?.averageRating >= 4 ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
                      {b.shop?.averageRating} ★
                    </span> ·
                    Budget: <span className="font-semibold">${parseFloat(b.budget).toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Product rating: {b.product?.averageRating} ★ · {b.product?.totalReviews} reviews
                  </p>
                </div>

                {b.status === 'REQUESTED' && (
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-1">
                      <label className="text-xs text-gray-500">Days:</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        defaultValue={7}
                        className="w-16 border border-gray-300 rounded-lg text-xs px-2 py-1.5 text-center"
                        onChange={(e) => setDurationInputs((p) => ({ ...p, [b.id]: parseInt(e.target.value) }))}
                      />
                    </div>
                    <button
                      onClick={() => approve(b.id)}
                      disabled={actionLoading === b.id}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 disabled:opacity-60 transition"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Reject reason..."
                        value={rejectReasons[b.id] || ''}
                        onChange={(e) => setRejectReasons((p) => ({ ...p, [b.id]: e.target.value }))}
                        className="border border-gray-300 rounded-l-lg text-xs px-2 py-1.5 w-36 focus:outline-none"
                      />
                      <button
                        onClick={() => reject(b.id)}
                        disabled={actionLoading === b.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-r-lg hover:bg-red-700 disabled:opacity-60 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {b.status !== 'REQUESTED' && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    b.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    b.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {b.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoostManagement;
