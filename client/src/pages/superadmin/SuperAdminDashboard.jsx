import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DollarSign, TrendingUp, Percent, Store, Clock, Crown } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const KpiCard = ({ icon: Icon, label, value, sub, color = 'text-amazon-orange' }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
    <div className={`p-3 bg-gray-50 rounded-full ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const token = useSelector((state) => state.auth.token);
  const [bi, setBi] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/superadmin/analytics/overview`, { headers }),
      axios.get(`${API}/superadmin/analytics/gmv-trend`, { headers }),
    ])
      .then(([biRes, trendRes]) => {
        setBi(biRes.data.data);
        setTrend(trendRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Crown className="w-7 h-7 text-amazon-orange" />
          Business Intelligence
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide financial overview.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label="Gross Merchandise Value"
          value={`$${(bi?.gmv || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="All-time, excl. cancelled"
          color="text-blue-600"
        />
        <KpiCard
          icon={TrendingUp}
          label="Platform Net Revenue"
          value={`$${(bi?.platformNetRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="Total commissions earned"
          color="text-green-600"
        />
        <KpiCard
          icon={Percent}
          label="Effective Take Rate"
          value={`${bi?.effectiveTakeRate || 0}%`}
          sub="Platform cut / GMV"
          color="text-purple-600"
        />
        <KpiCard
          icon={Store}
          label="Active Shops"
          value={bi?.shopStats?.active || 0}
          sub={`${bi?.shopStats?.pending || 0} pending · ${bi?.shopStats?.suspended || 0} suspended`}
          color="text-amazon-orange"
        />
      </div>

      {/* GMV Trend Chart */}
      {trend.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-800 mb-4">GMV & Platform Revenue (Monthly Trend)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={trend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip formatter={(v) => `$${parseFloat(v).toFixed(2)}`} />
              <Legend />
              <Area type="monotone" dataKey="gmv" name="GMV" stroke="#f97316" fill="url(#gmvGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="platformRevenue" name="Platform Revenue" stroke="#22c55e" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
