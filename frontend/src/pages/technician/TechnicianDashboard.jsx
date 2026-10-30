import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import { technicianService } from '../../services/technicianService';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { EmptyState } from '../../components/EmptyState';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Star, ArrowRight, ShieldAlert } from 'lucide-react';

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          complaintService.getComplaints(),
          technicianService.getStats(),
        ]);

        if (tasksRes.success && tasksRes.data) {
          setTasks(tasksRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to load technician dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const assignedTasks = tasks.filter((t) => t.status === 'Assigned');
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress');
  const resolvedTasks = tasks.filter((t) => ['Resolved', 'Verified/Closed'].includes(t.status));
  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'Urgent' || t.status === 'Escalated') && !['Resolved', 'Verified/Closed'].includes(t.status)
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold mb-3 border border-sky-500/30">
            <Wrench className="w-3.5 h-3.5" />
            <span>Technician Workdesk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Specialization: <strong className="text-white">{user?.technician?.specialization || 'Maintenance Specialist'}</strong>
          </p>
        </div>
        <Link
          to="/technician/tasks"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 transition shrink-0"
        >
          View Assigned Queue <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Urgent Ticket Alert if any */}
      {urgentTasks.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 text-rose-900 flex items-start gap-4 animate-pulse">
          <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="text-sm font-bold text-rose-950">
              Urgent Attention Required ({urgentTasks.length} High Priority Ticket)
            </h4>
            <p className="mt-1 text-rose-800">
              You have urgent tasks that require immediate inspection or repair. Please prioritize these tickets right away.
            </p>
            <div className="mt-3 flex gap-2">
              {urgentTasks.map((u) => (
                <Link
                  key={u.id}
                  to={`/technician/tasks`}
                  className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                >
                  {u.complaint_code}: {u.title.slice(0, 25)}...
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Tasks"
          value={assignedTasks.length}
          icon={<Clock className="w-5 h-5" />}
          color="amber"
          subtitle="Pending work commencement"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks.length}
          icon={<Wrench className="w-5 h-5" />}
          color="sky"
          subtitle="Active on-site repairs"
        />
        <StatCard
          title="Resolved"
          value={resolvedTasks.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
          subtitle="Successfully fixed"
        />
        <StatCard
          title="Resident Rating"
          value={`★ ${user?.technician?.rating_average || 5.0}`}
          icon={<Star className="w-5 h-5" />}
          color="purple"
          subtitle="Based on student reviews"
        />
      </div>

      {/* Immediate Tasks Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">Active Work Queue</h3>
            <p className="text-xs text-slate-400">Complaints currently assigned to you</p>
          </div>
          <Link
            to="/technician/tasks"
            className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
          >
            All Tasks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading your tasks...</div>
        ) : tasks.filter((t) => !['Resolved', 'Verified/Closed'].includes(t.status)).length === 0 ? (
          <EmptyState
            title="All tasks cleared!"
            description="You currently have no outstanding maintenance tickets assigned. Great job!"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks
              .filter((t) => !['Resolved', 'Verified/Closed'].includes(t.status))
              .slice(0, 5)
              .map((task) => (
                <div
                  key={task.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-3 rounded-2xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{task.complaint_code}</span>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <span className="text-[11px] font-semibold text-slate-600 px-2 py-0.5 rounded bg-slate-100">
                        {task.room ? `Block ${task.room.block} — Room ${task.room.room_number}` : 'Room N/A'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{task.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{task.description}</p>
                  </div>
                  <Link
                    to={`/technician/tasks`}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white text-xs font-bold transition shrink-0"
                  >
                    Open Ticket
                  </Link>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

