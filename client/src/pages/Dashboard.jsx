import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  FileCheck2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import StatCard from '../components/StatCard';
import {
  getSummaryStats,
  getDiagnosisDistribution,
  getAbnormalFrequency,
} from '../api/client';

const DIAGNOSIS_COLORS = {
  Normal: '#10b981',
  UTI: '#ef4444',
  Diabetes: '#f59e0b',
  'Kidney Disease': '#8b5cf6',
  'Liver Disease': '#ec4899',
  Dehydration: '#06b6d4',
  Unspecified: '#64748b',
};

export function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState([]);
  const [analyteData, setAnalyteData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [sumRes, diagRes, anaRes] = await Promise.all([
        getSummaryStats(),
        getDiagnosisDistribution(),
        getAbnormalFrequency(),
      ]);

      setSummary(sumRes);
      setDiagnosisData(diagRes);
      setAnalyteData(anaRes);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard analytics. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        <p className="text-sm font-medium">Loading clinical analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="glass-panel p-8 text-center max-w-xl mx-auto border-rose-500/30">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Dashboard Error</h3>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-sm font-semibold transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header & Quick Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Urinalysis Analytics & Overview
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Deterministic reference-range checks across patient urinalysis test events
          </p>
        </div>

        {summary?.pendingReview > 0 && (
          <NavLink
            to="/review"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-sm font-semibold transition-all shadow-lg shadow-amber-500/5 animate-pulse"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{summary.pendingReview} Pending Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Patients"
          value={summary?.totalPatients ?? 0}
          subtitle="Registered patient records"
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Total Readings"
          value={summary?.totalReadings ?? 0}
          subtitle="Dipstick test events"
          icon={FileCheck2}
          color="cyan"
        />
        <StatCard
          title="Pending Review"
          value={summary?.pendingReview ?? 0}
          subtitle="Require clinician verification"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Abnormal Rate"
          value={`${summary?.abnormalRate ?? 0}%`}
          subtitle="Readings with ≥ 1 flag"
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagnosis Distribution Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Diagnosis Distribution</h2>
              <p className="text-xs text-slate-400">
                Breakdown of diagnoses in current urinalysis records
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosisData}
                  dataKey="count"
                  nameKey="diagnosis"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  labelLine={false}
                >
                  {diagnosisData.map((entry) => (
                    <Cell
                      key={`cell-${entry.diagnosis}`}
                      fill={DIAGNOSIS_COLORS[entry.diagnosis] || '#64748b'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Abnormal Flag Frequency Chart */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Analyte Abnormal Frequency</h2>
              <p className="text-xs text-slate-400">
                How often each of the 10 dipstick analytes is flagged
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyteData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="analyteKey"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={false}
                  interval={0}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                  }}
                  formatter={(val, name, item) => [
                    `${val} readings (${item.payload.abnormalPercentage}%)`,
                    'Abnormal Count',
                  ]}
                />
                <Bar dataKey="abnormalCount" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
