import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/StatCard';
import { FileText, Printer, Download, Clock, CheckCircle2, TrendingUp, ShieldCheck } from 'lucide-react';

export const AdminReportsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await analyticsService.getDashboardAnalytics();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Compiling maintenance audit reports...</div>;
  }

  const { statusCounts = {}, categoryBreakdown = [], blockCounts = {}, avgResolutionHours = 0, technicianLeaderboard = [] } =
    analytics || {};

  const total = statusCounts.total || 1;
  const resolutionRate = Math.round(((statusCounts.resolved || 0) / total) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">HostelCare Maintenance Audit Report</h1>
          <p className="text-sm text-slate-500 mt-1">Official performance evaluation and infrastructure diagnostics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Overall Resolution Rate"
          value={`${resolutionRate}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          subtitle="Fixed vs Total"
        />
        <StatCard
          title="Average Resolution Time"
          value={`${avgResolutionHours} hrs`}
          icon={<Clock className="w-5 h-5" />}
          color="sky"
          subtitle="From lodge to fix"
        />
        <StatCard
          title="Total Registered Issues"
          value={statusCounts.total || 0}
          icon={<FileText className="w-5 h-5" />}
          color="blue"
          subtitle="Campus wide"
        />
        <StatCard
          title="Active Escalations"
          value={statusCounts.escalated || 0}
          icon={<ShieldCheck className="w-5 h-5" />}
          color="rose"
          subtitle="SLA exceeded"
        />
      </div>

      {/* Category breakdown table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
          Category Volume & Share Analysis
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3">Maintenance Category</th>
                <th className="py-2.5 px-3">Ticket Count</th>
                <th className="py-2.5 px-3">Share of Total</th>
                <th className="py-2.5 px-3">Recommended Preventive Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {categoryBreakdown.map((cat, i) => (
                <tr key={i}>
                  <td className="py-3 px-3 font-bold text-slate-900">{cat.category}</td>
                  <td className="py-3 px-3">{cat.count}</td>
                  <td className="py-3 px-3">{cat.percentage}%</td>
                  <td className="py-3 px-3 text-slate-500">
                    {cat.category === 'Electrical' && 'Bi-monthly wiring inspection and regulator inventory restock.'}
                    {cat.category === 'Plumbing' && 'Overhead tank valve maintenance and drain trap cleaning.'}
                    {cat.category === 'Water Supply' && 'Emergency pump replacement drill and filter checks.'}
                    {cat.category === 'Internet / Wi-Fi' && 'Firmware update and access point load balancing.'}
                    {cat.category === 'Furniture' && 'Carpentry round and desk runner reinforcement.'}
                    {!['Electrical', 'Plumbing', 'Water Supply', 'Internet / Wi-Fi', 'Furniture'].includes(cat.category) &&
                      'Regular scheduled facility audit.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hostel Block Comparison */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
          Hostel Blocks Comparative Load
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['A', 'B', 'C', 'D'].map((b) => (
            <div key={b} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-bold text-slate-400 block mb-1">Block {b}</span>
              <span className="text-2xl font-black text-slate-900">{blockCounts[b] || 0}</span>
              <p className="text-[11px] text-slate-500 mt-1">Logged tickets</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

