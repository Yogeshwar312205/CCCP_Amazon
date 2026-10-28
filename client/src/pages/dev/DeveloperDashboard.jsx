import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Terminal, Database, Cpu, RefreshCw, ChevronDown, AlertTriangle, CheckCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const MetricCard = ({ label, value, sub, color = 'text-green-400' }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
    <p className="text-xs text-gray-400 font-mono mb-1">{label}</p>
    <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-1 font-mono">{sub}</p>}
  </div>
);

const LOG_LEVEL_COLORS = {
  error: 'text-red-400',
  warn: 'text-yellow-400',
  info: 'text-green-400',
  debug: 'text-gray-400',
};

const DeveloperDashboard = () => {
  const token = useSelector((state) => state.auth.token);
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  const [migrations, setMigrations] = useState([]);
  const [tables, setTables] = useState([]);
  const [logLevel, setLogLevel] = useState('error');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [healthRes, logsRes, migrationsRes, tablesRes] = await Promise.all([
        axios.get(`${API}/dev/health`, { headers }),
        axios.get(`${API}/dev/logs`, { headers, params: { level: logLevel, lines: 50 } }),
        axios.get(`${API}/dev/migrations`, { headers }),
        axios.get(`${API}/dev/tables`, { headers }),
      ]);
      setHealth(healthRes.data.data);
      setLogs(logsRes.data.data?.entries || []);
      setMigrations(migrationsRes.data.data?.migrations || []);
      setTables(tablesRes.data.data?.tables || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, logLevel]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const vitals = health?.systemVitals;
  const dbStats = health?.dbStats;

  // Build chart data for heap usage
  const heapChartData = vitals ? [
    { name: 'Used', value: vitals.heapUsedMB },
    { name: 'Free', value: vitals.heapTotalMB - vitals.heapUsedMB },
  ] : [];

  const dbPoolData = dbStats && typeof dbStats.total === 'number' ? [
    { name: 'Using', value: dbStats.using || 0 },
    { name: 'Available', value: dbStats.available || 0 },
    { name: 'Waiting', value: dbStats.waiting || 0 },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-mono flex items-center gap-2 text-white">
          <Terminal className="w-7 h-7 text-green-400" />
          System Health
        </h1>
        <button
          onClick={fetchAll}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-600 text-green-400 text-xs font-mono font-bold rounded-lg hover:bg-gray-700 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* System Vitals */}
      {vitals && (
        <div>
          <h2 className="text-sm font-bold font-mono text-gray-300 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-green-400" /> Node.js Vitals
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard label="Heap Used" value={`${vitals.heapUsedMB} MB`} sub={`of ${vitals.heapTotalMB} MB total`} />
            <MetricCard label="RSS Memory" value={`${vitals.rssMB} MB`} color="text-blue-400" />
            <MetricCard label="Uptime" value={`${Math.floor(vitals.uptime / 3600)}h ${Math.floor((vitals.uptime % 3600) / 60)}m`} color="text-amazon-yellow" />
            <MetricCard label="CPU Load (1m)" value={vitals.cpuLoad1m} sub={`5m: ${vitals.cpuLoad5m} | 15m: ${vitals.cpuLoad15m}`} color="text-orange-400" />
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {heapChartData.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h3 className="text-xs font-mono font-bold text-gray-300 mb-3">Heap Memory (MB)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={heapChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill="#22c55e" />
                  <Cell fill="#374151" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {dbPoolData.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <h3 className="text-xs font-mono font-bold text-gray-300 mb-2 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-blue-400" /> DB Connection Pool
            </h3>
            <p className="text-xs text-gray-500 font-mono mb-3">
              Ping: {dbStats?.pingLatency} · Total pool size: {dbStats?.total}
            </p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={dbPoolData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '8px', fontSize: 11 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  <Cell fill="#3b82f6" />
                  <Cell fill="#22c55e" />
                  <Cell fill="#f97316" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Log Viewer */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-bold font-mono text-gray-300 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-green-400" /> Log Viewer
          </h2>
          <div className="flex gap-2">
            {['error', 'combined'].map((l) => (
              <button
                key={l}
                onClick={() => { setLogLevel(l); }}
                className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border transition ${
                  logLevel === l
                    ? 'bg-green-500 text-gray-900 border-green-500'
                    : 'bg-gray-700 text-gray-400 border-gray-600 hover:border-green-500'
                }`}
              >
                {l}.log
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-950 rounded-lg p-3 h-64 overflow-y-auto font-mono text-xs space-y-0.5">
          {logs.length === 0 ? (
            <p className="text-gray-500">No log entries found.</p>
          ) : (
            logs.slice().reverse().map((entry, i) => (
              <div key={i} className={`${LOG_LEVEL_COLORS[entry.level] || 'text-gray-400'}`}>
                <span className="text-gray-600">{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : ''}</span>
                {entry.timestamp && ' '}
                <span className="uppercase font-bold">{entry.level || '   '}</span>
                {' '}
                <span>{entry.message || entry.raw || JSON.stringify(entry)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Migrations */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h2 className="text-sm font-bold font-mono text-gray-300 mb-3">Recent Migrations</h2>
        <div className="space-y-1">
          {migrations.length === 0 ? (
            <p className="text-gray-500 text-xs font-mono">No migrations found.</p>
          ) : (
            migrations.map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{m.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Table Stats */}
      {tables.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
          <h2 className="text-sm font-bold font-mono text-gray-300 mb-3">Database Tables ({tables.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {tables.map((t) => (
              <div key={t.table} className="bg-gray-900 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 truncate mr-2">{t.table}</span>
                <span className="text-xs font-bold font-mono text-green-400 flex-shrink-0">{t.rowCount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperDashboard;
