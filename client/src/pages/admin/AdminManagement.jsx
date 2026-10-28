import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UserPlus, ShieldCheck, RefreshCw, Search, Users, Ban, CheckCircle2 } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import { fetchAdminAccounts } from '../../features/admin/adminSlice';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  isActive: true,
};

const AdminManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { adminAccounts, adminAccountsPagination, adminAccountsLoading } = useSelector((state) => state.admin);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      dispatch(fetchAdminAccounts({ page: currentPage, limit: 10, search }));
    }
  }, [dispatch, currentPage, search, user]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await adminApi.createAdmin({ ...form, role: 'ADMIN' });
      setForm(initialForm);
      setShowCreateForm(false);
      setSuccess('Admin account created successfully');
      setCurrentPage(1);
      dispatch(fetchAdminAccounts({ page: 1, limit: 10, search }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, nextStatus) => {
    try {
      await adminApi.updateAdminStatus(adminId, { isActive: nextStatus });
      dispatch(fetchAdminAccounts({ page: currentPage, limit: 10, search }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin status');
    }
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center max-w-xl mx-auto my-8">
        <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Super Admin Access Required</h2>
        <p className="text-sm text-gray-600">
          This section manages all admin accounts and is restricted to the root administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amazon-yellow" />
            <h1 className="text-xl font-bold text-gray-900">Admin Management</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">Create, review, and manage admin accounts for operational access.</p>
        </div>

        <button
          onClick={() => setShowCreateForm((prev) => !prev)}
          className="inline-flex items-center gap-2 bg-amazon-yellow hover:bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs shadow transition"
        >
          <UserPlus className="w-4 h-4" />
          {showCreateForm ? 'Close Form' : 'Create Admin'}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-gray-900">New Admin Account</h2>
          {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>}
          {success && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email address" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs md:col-span-2" />
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs md:col-span-2" />
            <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (8+ chars incl. number and uppercase)" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs md:col-span-2" />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center gap-2 text-xs text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              Active immediately
            </label>

            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700">Cancel</button>
              <button type="submit" disabled={loading} className="px-3 py-2 bg-amazon-blue text-white rounded-lg text-xs font-bold disabled:opacity-60">
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute top-3 left-3" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search admin by name or email"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <button
            onClick={() => dispatch(fetchAdminAccounts({ page: currentPage, limit: 10, search }))}
            className="inline-flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-700"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-5 py-3">Admin</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adminAccountsLoading ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading admin accounts...</td></tr>
              ) : adminAccounts.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">No admin accounts found.</td></tr>
              ) : (
                adminAccounts.map((admin) => (
                  <tr key={admin.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <div className="font-bold text-gray-900">{admin.firstName} {admin.lastName}</div>
                      <div className="text-gray-500 mt-0.5">{admin.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">{admin.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {admin.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {admin.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(admin.id, !admin.isActive)}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded border ${admin.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                        >
                          {admin.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {adminAccountsPagination && adminAccountsPagination.totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-2 text-xs text-gray-600">Page {currentPage} of {adminAccountsPagination.totalPages}</span>
          <button
            disabled={currentPage >= adminAccountsPagination.totalPages}
            onClick={() => setCurrentPage((p) => Math.min(adminAccountsPagination.totalPages, p + 1))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
