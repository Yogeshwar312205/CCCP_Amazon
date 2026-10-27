import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Percent, Save, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const CommissionSettings = () => {
  const token = useSelector((state) => state.auth.token);
  const [commissions, setCommissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ categoryId: '', commissionRate: '', label: '' });

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/superadmin/commission`, { headers }),
      axios.get(`${API}/categories`, { headers }),
      axios.get(`${API}/superadmin/settings`, { headers }),
    ])
      .then(([commRes, catRes, settingsRes]) => {
        setCommissions(commRes.data.data || []);
        setCategories(catRes.data.data || []);
        setSettings(settingsRes.data.data || null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchAll, [token]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmitCommission = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/superadmin/commission`, form, { headers });
      setForm({ categoryId: '', commissionRate: '', label: '' });
      fetchAll();
      showToast('Commission rate saved.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save.');
    }
  };

  const handleUpdateDefaultRate = async () => {
    try {
      await axios.put(
        `${API}/superadmin/settings`,
        { defaultCommissionRate: settings.defaultCommissionRate },
        { headers }
      );
      showToast('Default commission rate updated.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed.');
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
        <Percent className="w-7 h-7 text-amazon-orange" />
        Commission Rates
      </h1>

      {toast && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
        </div>
      )}

      {/* Global default */}
      {settings && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amazon-orange" /> Global Default Commission
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Applied when no per-category rate or per-seller override exists.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={settings.defaultCommissionRate}
              onChange={(e) => setSettings((s) => ({ ...s, defaultCommissionRate: e.target.value }))}
              className="w-28 border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            />
            <span className="text-sm text-gray-500">%</span>
            <button
              onClick={handleUpdateDefaultRate}
              className="flex items-center gap-1.5 px-4 py-2 bg-amazon-orange text-white text-xs font-bold rounded-lg hover:bg-orange-600 transition"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          </div>
        </div>
      )}

      {/* Per-category rates */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-gray-800 mb-4">Category-Level Commission Rates</h2>
        <form onSubmit={handleSubmitCommission} className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          >
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            required
            placeholder="Rate (%)"
            value={form.commissionRate}
            onChange={(e) => setForm((p) => ({ ...p, commissionRate: e.target.value }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={form.label}
            onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
            className="border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amazon-orange text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition"
          >
            <Save className="w-4 h-4" /> Save Rate
          </button>
        </form>

        {commissions.length === 0 ? (
          <p className="text-sm text-gray-400">No per-category rates configured yet. Global default applies.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Category</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Label</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{c.category?.name}</td>
                  <td className="px-4 py-2 text-gray-500">{c.label || '—'}</td>
                  <td className="px-4 py-2 text-right font-bold text-amazon-orange">{c.commissionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CommissionSettings;
