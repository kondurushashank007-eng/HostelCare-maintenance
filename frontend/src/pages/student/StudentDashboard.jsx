import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { EmptyState } from '../../components/EmptyState';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  PhoneCall,
  ShieldAlert,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await complaintService.getComplaints();
        if (res.success && res.data) {
          setComplaints(res.data);
        }
      } catch (err) {
        console.error('Failed to load student complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

  const activeComplaints = complaints.filter(
    (c) => !['Resolved', 'Verified/Closed'].includes(c.status)
  );
  const resolvedComplaints = complaints.filter((c) =>
    ['Resolved', 'Verified/Closed'].includes(c.status)
  );
  const pendingCount = complaints.filter((c) =>
    ['Submitted', 'Pending'].includes(c.status)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Assisted Resolution Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              {user?.room
                ? `Allocated to Block ${user.room.block} — Room ${user.room.room_number}. Need a repair? Lodge a ticket and our maintenance crew will fix it.`
                : 'Need a repair? Lodge a ticket and our maintenance crew will fix it.'}
            </p>
          </div>
          <Link
            to="/student/complaints/new"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-lg shadow-sky-500/30 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Lodge Complaint
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Complaints"
          value={activeComplaints.length}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Under review or in repair"
        />
        <StatCard
          title="Awaiting Assignment"
          value={pendingCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="sky"
          subtitle="Pending warden dispatch"
        />
        <StatCard
          title="Resolved Issues"
          value={resolvedComplaints.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          subtitle="Fixed & verified"
        />
      </div>

      {/* Active Issues Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Active Complaints</h2>
            <p className="text-xs text-slate-500">Live progress of tickets submitted by you</p>
          </div>
          <Link
            to="/student/complaints"
            className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            View all history <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
            Loading your maintenance tickets...
          </div>
        ) : activeComplaints.length === 0 ? (
          <EmptyState
            title="All clear! No active complaints."
            description="Your room has no ongoing maintenance issues. If something breaks, submit a complaint anytime."
            action={
              <Link
                to="/student/complaints/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                <PlusCircle className="w-3.5 h-3.5" /> File New Issue
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {activeComplaints.map((item) => (
              <div
                key={item.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-3 rounded-2xl transition"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{item.complaint_code}</span>
                    <StatusBadge status={item.status} />
                    <PriorityBadge priority={item.priority} />
                    <span className="text-[11px] font-medium text-slate-500 px-2 py-0.5 rounded-md bg-slate-100">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <Link
                    to={`/student/complaints/${item.id}`}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-xs font-semibold transition"
                  >
                    Track Progress
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contact Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Electrician Helpline</p>
            <p className="text-sm font-bold text-slate-800">+91 98111 22334</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Plumber Helpline</p>
            <p className="text-sm font-bold text-slate-800">+91 98222 33445</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Warden Emergency Line</p>
            <p className="text-sm font-bold text-slate-800">+91 98765 43210</p>
          </div>
        </div>
      </div>
    </div>
  );
};

