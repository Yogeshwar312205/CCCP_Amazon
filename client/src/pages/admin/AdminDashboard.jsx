import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchOverviewStats,
  fetchSalesChart,
  fetchTopProducts,
} from '../../features/admin/adminSlice';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  Package,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const {
    overview,
    salesChart,
    topProducts,
    analyticsLoading,
  } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchOverviewStats());
    dispatch(fetchSalesChart(14));
    dispatch(fetchTopProducts(5));
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Revenue',
      value: overview ? `$${parseFloat(overview.totalRevenue).toFixed(2)}` : '$0.00',
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
    {
      title: 'Total Orders',
      value: overview ? overview.totalOrders : 0,
      icon: ShoppingBag,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Active Customers',
      value: overview ? overview.totalCustomers : 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Low Stock Alerts',
      value: overview ? overview.lowStockItemsCount : 0,
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-700',
      link: '/admin/inventory?lowStock=true',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard & Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time store performance, sales metrics, and operational overview.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.title}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">{s.value}</h3>
                {s.link && (
                  <Link
                    to={s.link}
                    className="text-[11px] text-red-600 hover:underline font-semibold flex items-center gap-0.5 mt-1"
                  >
                    View low stock items <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div className={`p-3 rounded-full ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amazon-orange" />
                Revenue Trend (Last 14 Days)
              </h2>
              <p className="text-xs text-gray-500">Authoritative daily sales totals</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {salesChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesChart}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f08804" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f08804" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val}`} />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f08804"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No revenue recorded in the selected period.
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products (1 col) */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-amazon-orange" />
            Top Selling Products
          </h2>

          {topProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {topProducts.map((p, idx) => (
                <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-3">
                    <div className="font-semibold text-gray-900 truncate">{p.productName}</div>
                    <div className="text-gray-500 mt-0.5">{p.totalSold} units sold</div>
                  </div>
                  <div className="font-bold text-gray-900 flex-shrink-0">
                    ${p.totalRevenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 py-8 text-center">No sales data recorded yet.</p>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
          <Link to="/admin/orders" className="text-xs text-blue-600 hover:underline font-semibold">
            View All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] border-b">
              <tr>
                <th className="px-5 py-3">Order #</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overview?.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-semibold text-gray-900">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-gray-700">
                    {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest'}
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(order.placedAt || order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-bold text-gray-900">
                    ${parseFloat(order.totalAmount).toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'SHIPPED'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'PROCESSING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      to={`/admin/orders`}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
              {(!overview?.recentOrders || overview.recentOrders.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    No orders placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
