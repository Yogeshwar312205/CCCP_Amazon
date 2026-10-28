import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Zap, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const STATUS_STYLES = {
  REQUESTED: { cls: 'bg-yellow-100 text-yellow-700', icon: Clock },
  APPROVED: { cls: 'bg-green-100 text-green-700', icon: CheckCircle },
  REJECTED: { cls: 'bg-red-100 text-red-700', icon: XCircle },
  EXPIRED: { cls: 'bg-gray-100 text-gray-500', icon: AlertCircle },
};

const SellerBoosts = () => {
  const token = useSelector((state) => state.auth.token);
  const [boosts, setBoosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ productId: '', budget: '', durationDays: 7 });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/seller/boosts`, { headers }),
      axios.get(`${API}/seller/products`, { headers }),
    ])
      .then(([boostRes, prodRes]) => {
        setBoosts(boostRes.data.data || []);
        setProducts(prodRes.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await axios.post(`${API}/seller/boosts`, form, { headers });
      setForm({ productId: '', budget: '', durationDays: 7 });
      fetchData();
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit boost request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Zap className="w-7 h-7 text-amazon-orange" />
        Boost Campaigns
      </h1>

      {/* Submit Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amazon-orange" />
          Request a New Boost
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Product</label>
            <select
              required
              value={form.productId}
              onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Budget ($)</label>
            <input
              type="number"
              min="10"
              step="1"
              required
              placeholder="e.g. 50"
              value={form.budget}
              onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Duration (days)</label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={form.durationDays}
              onChange={(e) => setForm((p) => ({ ...p, durationDays: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            />
          </div>
          {submitError && (
            <div className="sm:col-span-3 flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-amazon-orange text-white text-sm font-bold rounded-lg hover:bg-orange-600 disabled:opacity-60 transition"
            >
              {submitting ? 'Submitting...' : 'Submit Boost Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Boost History */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Campaign History</h2>
        </div>
        {boosts.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No boost campaigns yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Product</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Budget</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-gray-500">Dates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {boosts.map((b) => {
                const style = STATUS_STYLES[b.status] || STATUS_STYLES.EXPIRED;
                const Icon = style.icon;
                return (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {b.product?.title || `Product #${b.productId}`}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-700">
                      ${parseFloat(b.budget).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${style.cls}`}>
                        <Icon className="w-3 h-3" />
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-gray-500">
                      {b.startDate
                        ? `${new Date(b.startDate).toLocaleDateString()} – ${new Date(b.endDate).toLocaleDateString()}`
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerBoosts;
