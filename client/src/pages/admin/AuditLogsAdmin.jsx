import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Laptop,
  Globe,
  FileCode,
} from 'lucide-react';
import { fetchAuditLogs } from '../../features/admin/adminSlice';

const AuditLogsAdmin = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { auditLogs, auditPagination, auditLoading, error } = useSelector((state) => state.admin);

  const [expandedLogId, setExpandedLogId] = useState(null);
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(
        fetchAuditLogs({
          page: currentPage,
          limit: 15,
          action: selectedAction,
          entityType: selectedEntityType,
        })
      );
    }
  }, [dispatch, isSuperAdmin, currentPage, selectedAction, selectedEntityType]);

  const handleRefresh = () => {
    dispatch(
      fetchAuditLogs({
        page: currentPage,
        limit: 15,
        action: selectedAction,
        entityType: selectedEntityType,
      })
    );
  };

  const toggleExpand = (id) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  const getActionColor = (action) => {
    if (!action) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (action.includes('CREATE') || action.includes('APPROVE') || action.includes('RESTOCK')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('UPDATE') || action.includes('ADJUST') || action.includes('TOGGLE')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('CANCEL')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center max-w-2xl mx-auto my-12">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-gray-600 mb-4">
          The System Audit Trail contains sensitive administrative records and is strictly restricted to{' '}
          <span className="font-semibold text-gray-900">SUPER_ADMIN</span> personnel.
        </p>
        <div className="inline-block bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-xs text-gray-500">
          Current Role: <span className="font-bold text-amazon-blue">{user?.role || 'None'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">System Audit Trail</h1>
            <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Immutable
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Tamper-proof record of all admin mutations, status overrides, and stock adjustments.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={auditLoading}
          className="flex items-center gap-2 px-3.5 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-gray-600 font-semibold mr-1">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span>Filters:</span>
        </div>

        {/* Action Filter */}
        <select
          value={selectedAction}
          onChange={(e) => {
            setSelectedAction(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amazon-yellow cursor-pointer"
        >
          <option value="">All Actions</option>
          <option value="UPDATE_ORDER_STATUS">UPDATE_ORDER_STATUS</option>
          <option value="RETURN_APPROVE">RETURN_APPROVE</option>
          <option value="RETURN_REJECT">RETURN_REJECT</option>
          <option value="RETURN_RECEIVE">RETURN_RECEIVE</option>
          <option value="RETURN_COMPLETE_REFUND">RETURN_COMPLETE_REFUND</option>
          <option value="CREATE_PRODUCT">CREATE_PRODUCT</option>
          <option value="UPDATE_PRODUCT">UPDATE_PRODUCT</option>
          <option value="TOGGLE_PRODUCT_STATUS">TOGGLE_PRODUCT_STATUS</option>
          <option value="ADJUST_INVENTORY">ADJUST_INVENTORY</option>
        </select>

        {/* Entity Type Filter */}
        <select
          value={selectedEntityType}
          onChange={(e) => {
            setSelectedEntityType(e.target.value);
            setCurrentPage(1);
          }}
          className="border border-gray-300 rounded-lg px-2.5 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amazon-yellow cursor-pointer"
        >
          <option value="">All Entities</option>
          <option value="ORDER">ORDER</option>
          <option value="RETURN">RETURN</option>
          <option value="PRODUCT">PRODUCT</option>
          <option value="INVENTORY">INVENTORY</option>
        </select>

        {(selectedAction || selectedEntityType) && (
          <button
            onClick={() => {
              setSelectedAction('');
              setSelectedEntityType('');
              setCurrentPage(1);
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {auditLoading && (!auditLogs || auditLogs.length === 0) ? (
          <div className="p-12 text-center text-xs text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
            Loading audit logs...
          </div>
        ) : !auditLogs || auditLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileCode className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">No audit logs found</p>
            <p className="text-xs text-gray-400 mt-1">Actions performed by admins will be recorded here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <th className="py-3 px-4 font-semibold w-10"></th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold">Admin User</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                  <th className="py-3 px-4 font-semibold">Entity</th>
                  <th className="py-3 px-4 font-semibold">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className={`hover:bg-gray-50 transition cursor-pointer ${
                          isExpanded ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-gray-400">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-gray-800">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.user ? (
                            <div>
                              <div className="font-semibold text-gray-900">
                                {log.user.firstName} {log.user.lastName}
                              </div>
                              <div className="text-[11px] text-gray-500">{log.user.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">User #{log.userId || 'N/A'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] border ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-semibold text-gray-800">{log.entityType}</span>
                          {log.entityId && (
                            <span className="text-gray-500 ml-1">#{log.entityId}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Globe className="w-3 h-3 text-gray-400" />
                            <span>{log.ipAddress || '127.0.0.1'}</span>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable JSON Diff Row */}
                      {isExpanded && (
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <td colSpan={6} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Old Values */}
                              <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2 pb-1 border-b border-red-100">
                                  <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                                    Previous State (Old Values)
                                  </span>
                                </div>
                                <pre className="text-[11px] bg-red-50/50 p-2.5 rounded text-gray-800 font-mono overflow-x-auto max-h-48">
                                  {log.oldValues
                                    ? JSON.stringify(log.oldValues, null, 2)
                                    : 'null (Initial record or not tracked)'}
                                </pre>
                              </div>

                              {/* New Values */}
                              <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                                <div className="flex items-center justify-between mb-2 pb-1 border-b border-emerald-100">
                                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                                    Mutated State (New Values)
                                  </span>
                                </div>
                                <pre className="text-[11px] bg-emerald-50/50 p-2.5 rounded text-gray-800 font-mono overflow-x-auto max-h-48">
                                  {log.newValues
                                    ? JSON.stringify(log.newValues, null, 2)
                                    : 'null'}
                                </pre>
                              </div>
                            </div>

                            {log.userAgent && (
                              <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                                <Laptop className="w-3 h-3" />
                                <span>Agent: {log.userAgent}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {auditPagination && auditPagination.totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Showing page <span className="font-semibold text-gray-800">{auditPagination.page}</span> of{' '}
              <span className="font-semibold text-gray-800">{auditPagination.totalPages}</span> ({auditPagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= auditPagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsAdmin;
