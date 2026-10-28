import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, ShieldCheck, UserCheck } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const AdminScopeSelector = ({ selectedAdminId, onSelect }) => {
  const { user } = useSelector((state) => state.auth);
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') return;
    let active = true;
    setLoading(true);
    adminApi.getAdmins({ limit: 100, search })
      .then((response) => {
        if (active) setAdmins(response.data || []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.message || 'Unable to load admins');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user?.role, search]);

  const visibleAdmins = useMemo(
    () => admins.filter((admin) => admin.role === 'ADMIN' || admin.role === 'SUPER_ADMIN'),
    [admins]
  );

  if (user?.role !== 'SUPER_ADMIN') return null;

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amazon-orange" />
            <h2 className="font-bold text-gray-900">Select an Owner</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Choose an Admin or Super Admin to inspect only their products and related operations.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className="w-full pl-8 pr-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-amazon-orange"
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="text-xs text-gray-500">Loading admins...</p>
      ) : visibleAdmins.length === 0 ? (
        <p className="text-xs text-gray-500">No Admin or Super Admin accounts found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {visibleAdmins.map((admin) => {
            const active = String(selectedAdminId) === String(admin.id);
            return (
              <button
                type="button"
                key={admin.id}
                onClick={() => onSelect(active ? null : admin.id)}
                className={`text-left rounded-lg border p-3 transition ${
                  active
                    ? 'border-amazon-orange bg-orange-50 ring-1 ring-amazon-orange'
                    : 'border-gray-200 hover:border-amazon-orange'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {admin.firstName} {admin.lastName}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate">{admin.email}</p>
                    <p className="text-[10px] font-semibold text-amazon-orange mt-1">
                      {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                  <UserCheck className={`w-4 h-4 ${active ? 'text-amazon-orange' : 'text-gray-300'}`} />
                </div>
                <div className="grid grid-cols-4 gap-1 mt-3 text-center text-[10px]">
                  <span><b className="block text-gray-900">{admin.stats?.productCount || 0}</b>Products</span>
                  <span><b className="block text-gray-900">{admin.stats?.categoryCount || 0}</b>Categories</span>
                  <span><b className="block text-gray-900">{admin.stats?.orderCount || 0}</b>Orders</span>
                  <span><b className="block text-gray-900">{admin.stats?.returnCount || 0}</b>Returns</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      {!selectedAdminId && <p className="text-xs font-semibold text-amazon-orange">Select an admin to view module data.</p>}
    </section>
  );
};

export default AdminScopeSelector;
