import React, { useState, useEffect } from 'react';
import { Settings, Save, RotateCcw, CheckCircle2, Store, DollarSign, Truck, AlertTriangle } from 'lucide-react';

const DEFAULT_SETTINGS = {
  storeName: 'Amazon Clone CCCP',
  supportEmail: 'support@amazon.com',
  currency: 'USD ($)',
  taxRatePercent: 8.5,
  freeShippingThreshold: 35.0,
  defaultShippingFee: 5.99,
  lowStockThreshold: 5,
  autoCancelPendingDays: 3,
  notificationsEnabled: true,
};

const SettingsAdmin = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('cccp_admin_store_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('cccp_admin_store_settings', JSON.stringify(settings));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('cccp_admin_store_settings');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amazon-yellow" />
            <h1 className="text-xl font-bold text-gray-900">Store Configuration & Policy</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure global store parameters, checkout calculations, and fulfillment defaults.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* General Store Identity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Store className="w-4 h-4 text-amazon-orange" />
            <h2 className="text-sm font-bold text-gray-900">General Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Store Name</label>
              <input
                type="text"
                name="storeName"
                value={settings.storeName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Customer Support Email</label>
              <input
                type="email"
                name="supportEmail"
                value={settings.supportEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Display Currency</label>
              <input
                type="text"
                name="currency"
                value={settings.currency}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Taxes and Checkout Rules */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">Pricing & Tax Rules</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Estimated Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                name="taxRatePercent"
                value={settings.taxRatePercent}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Applied during order checkout tax calculation</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Free Shipping Minimum Threshold ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="freeShippingThreshold"
                value={settings.freeShippingThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Orders equal or above qualify for $0 shipping</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Standard Shipping Fee ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="defaultShippingFee"
                value={settings.defaultShippingFee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Charged for orders below threshold</span>
            </div>
          </div>
        </div>

        {/* Inventory & Operations */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Truck className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Inventory & Operations Defaults</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Default Low Stock Alert Threshold</label>
              <input
                type="number"
                min="1"
                name="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Triggers low-stock warning in inventory management</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Pending Order Auto-Cancel (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                name="autoCancelPendingDays"
                value={settings.autoCancelPendingDays}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Unpaid orders cancelled after this duration</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-6 py-2 bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsAdmin;
