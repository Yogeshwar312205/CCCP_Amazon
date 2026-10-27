import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Settings, Save, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const PlatformSettingsPage = () => {
  const token = useSelector((state) => state.auth.token);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    axios
      .get(`${API}/superadmin/settings`, { headers })
      .then((r) => setSettings(r.data.data))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/superadmin/settings`, settings, { headers });
      setToast('Settings saved.');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  const fields = [
    { key: 'defaultCommissionRate', label: 'Default Commission Rate (%)', type: 'number', step: '0.5', min: 0, max: 100 },
    { key: 'escrowReturnWindowDays', label: 'Escrow Return Window (days)', type: 'number', step: '1', min: 1, max: 90 },
    { key: 'maxBoostProductsPer10', label: 'Max Boosted Products per 10 Results', type: 'number', step: '1', min: 1, max: 10 },
    { key: 'autoSuspendRefundRateThreshold', label: 'Auto-Suspend Refund Rate Threshold (%)', type: 'number', step: '0.5', min: 1, max: 100 },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <Settings className="w-7 h-7 text-amazon-orange" />
        Platform Settings
      </h1>

      {toast && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> {toast}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
        {fields.map(({ key, label, ...inputProps }) => (
          <div key={key}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            <input
              {...inputProps}
              value={settings?.[key] ?? ''}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
              className="w-full max-w-xs border border-gray-300 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amazon-orange"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-amazon-orange text-white text-sm font-bold rounded-lg hover:bg-orange-600 disabled:opacity-60 transition"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default PlatformSettingsPage;
