import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { complaintService } from '../../services/complaintService';
import { useNotification } from '../../context/NotificationContext';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import {
  ListTodo,
  Clock,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  Bot,
  RefreshCw,
  Star,
  ArrowRight,
  TrendingUp,
  Building2,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const { showToast } = useNotification();

  const loadData = async () => {
    try {
      const [analyticsRes, complaintsRes] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        complaintService.getComplaints({ limit: 10 }),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
      if (complaintsRes.success && complaintsRes.data) {
        setComplaints(complaintsRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      showToast('Failed to load live analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerEscalations = async () => {
    setEscalating(true);
    try {
      const res = await complaintService.checkEscalations();
      if (res.success && res.data) {
        showToast(
          `Escalation check complete: ${res.data.escalatedCount} ticket(s) escalated`,
          'info'
        );
        loadData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        Loading hostel maintenance analytics & live database metrics...
      </div>
    );
  }

  const { statusCounts = {}, categoryBreakdown = [], blockCounts = {}, technicianLeaderboard = [] } =
    analytics || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Warden Maintenance Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time hostel infrastructure monitoring, technician dispatch, and AI triage
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleTriggerEscalations}
            disabled={escalating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            {escalating ? 'Checking Overdue...' : 'Run Escalation Check'}
          </button>
          <Link
            to="/admin/ai-assistant"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
          >
            <Bot className="w-3.5 h-3.5" />
            AI Copilot
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Complaints"
          value={statusCounts.total || 0}
          icon={<ListTodo className="w-5 h-5" />}
          color="blue"
          subtitle="All-time registered"
        />
        <StatCard
          title="Pending Triage"
          value={statusCounts.pending || 0}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Awaiting dispatch"
        />
        <StatCard
          title="In Progress"
          value={statusCounts.inProgress || 0}
          icon={<Wrench className="w-5 h-5" />}
          color="sky"
          subtitle="Technicians on-site"
        />
        <StatCard
          title="Resolved / Closed"
          value={statusCounts.resolved || 0}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          subtitle="Fixed successfully"
        />
        <StatCard
          title="Escalated & Overdue"
          value={statusCounts.escalated || 0}
          icon={<AlertOctagon className="w-5 h-5" />}
          color="rose"
          subtitle="SLA breached"
          badge={statusCounts.escalated > 0 ? 'Urgent' : null}
        />
      </div>

      {/* Analytics Visual Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Complaint Distribution by Category</h3>
              <p className="text-xs text-slate-400">Identify chronic infrastructure bottlenecks</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-1">
            {categoryBreakdown.slice(0, 6).map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700">{cat.category}</span>
                  <span className="text-slate-500">
                    {cat.count} tickets ({cat.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${Math.max(cat.percentage, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Hostel Block Breakdown</h3>
              <p className="text-xs text-slate-400">Wing-wise ticket concentration</p>
            </div>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {['A', 'B', 'C', 'D'].map((block) => (
              <div key={block} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 text-center">
                <span className="text-xs font-bold text-slate-400 block mb-1">Block {block}</span>
                <span className="text-2xl font-black text-slate-800">{blockCounts[block] || 0}</span>
                <p className="text-[10px] text-slate-500 mt-1">Complaints</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technician Workload & Performance */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Technician Fleet & Performance</h3>
            <p className="text-xs text-slate-400">Active workload and student satisfaction ratings</p>
          </div>
          <Link
            to="/admin/technicians"
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            Manage Technicians <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Technician</th>
                <th className="py-2.5 px-3">Specialization</th>
                <th className="py-2.5 px-3">Active Tasks</th>
                <th className="py-2.5 px-3">Resolved</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {technicianLeaderboard.map((tech) => (
                <tr key={tech.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">{tech.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {tech.specialization}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${tech.activeTasks > 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {tech.activeTasks} tasks
                    </span>
                  </td>
                  <td className="py-3 px-3">{tech.resolvedTasks} tickets</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {tech.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Complaints Queue</h3>
            <p className="text-xs text-slate-400">Incoming student tickets requiring oversight</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            View Full Table <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Room</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {complaints.slice(0, 6).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3 font-black text-slate-900">{c.complaint_code}</td>
                  <td className="py-3 px-3">
                    {c.room ? `B${c.room.block}-${c.room.room_number}` : 'N/A'}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 max-w-xs truncate">{c.title}</td>
                  <td className="py-3 px-3">{c.category}</td>
                  <td className="py-3 px-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      to={`/admin/complaints/${c.id}`}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white font-bold transition text-[11px]"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

