import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, DollarSign, TrendingUp, Package,
  Clock, AlertCircle, ArrowRight, Store
} from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-amazon-orange' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
    <div className={`p-3 rounded-full bg-gray-50 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SellerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.token);
  const [analytics, setAnalytics] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API}/seller/analytics`, { headers }),
      axios.get(`${API}/shops/me/profile`, { headers }),
    ])
      .then(([analyticsRes, shopRes]) => {
        setAnalytics(analyticsRes.data.data);
        setShop(shopRes.data.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amazon-orange" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const stats = analytics?.last30Days || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-amazon-orange" />
            {shop?.name || 'My Shop'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {user?.firstName}. Here's your last 30 days.
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
          shop?.status === 'ACTIVE'
            ? 'bg-green-100 text-green-700'
            : shop?.status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {shop?.status}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Earnings (30d)"
          value={`$${parseFloat(stats.totalEarnings || 0).toFixed(2)}`}
          sub="After platform commission"
          color="text-green-600"
        />
        <StatCard
          icon={TrendingUp}
          label="GMV (30d)"
          value={`$${parseFloat(stats.totalGMV || 0).toFixed(2)}`}
          sub="Gross merchandise value"
          color="text-blue-600"
        />
        <StatCard
          icon={ShoppingBag}
          label="Orders (30d)"
          value={stats.totalOrders || 0}
          sub="Excluding cancelled"
          color="text-amazon-orange"
        />
        <StatCard
          icon={Clock}
          label="Pending Escrow"
          value={`$${parseFloat(analytics?.pendingEscrowAmount || 0).toFixed(2)}`}
          sub="Awaiting return window"
          color="text-purple-600"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/seller/orders', label: 'View Orders', icon: ShoppingBag },
          { to: '/seller/products', label: 'Manage Products', icon: Package },
          { to: '/seller/balance', label: 'Check Balance', icon: DollarSign },
        ].map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-amazon-orange hover:shadow-sm transition group"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-amazon-orange" />
              <span className="text-sm font-semibold text-gray-700">{label}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-amazon-orange transition" />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;
