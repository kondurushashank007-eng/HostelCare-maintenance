import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { uploadService } from '../../services/uploadService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { EmptyState } from '../../components/EmptyState';
import { Modal } from '../../components/Modal';
import {
  Wrench,
  Building2,
  User,
  Phone,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Upload,
  AlertTriangle,
} from 'lucide-react';

export const TechnicianTasksPage = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status Filter
  const [filter, setFilter] = useState('ACTIVE'); // 'ACTIVE', 'Assigned', 'In Progress', 'Resolved'

  // Resolve Modal State
  const [activeTask, setActiveTask] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveRemarks, setResolveRemarks] = useState('');
  const [resolveFiles, setResolveFiles] = useState([]);
  const [resolvePreviews, setResolvePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await complaintService.getComplaints();
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load technician tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAcceptTask = async (taskId) => {
    try {
      await complaintService.updateStatus(taskId, {
        status: 'In Progress',
        remarks: `Technician ${user?.name} acknowledged the ticket and commenced work.`,
      });
      showToast('Work started! Task marked In Progress.', 'success');
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenResolveModal = (task) => {
    setActiveTask(task);
    setResolveRemarks('');
    setResolveFiles([]);
    setResolvePreviews([]);
    setShowResolveModal(true);
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!activeTask) return;
    setSubmitting(true);
    try {
      let resolutionImages = [];
      if (resolveFiles.length > 0) {
        const uploadRes = await uploadService.uploadImages(resolveFiles);
        if (uploadRes.success && uploadRes.data?.urls) {
          resolutionImages = uploadRes.data.urls;
        }
      }

      await complaintService.updateStatus(activeTask.id, {
        status: 'Resolved',
        remarks: resolveRemarks || 'Maintenance repair executed and verified.',
        resolutionImages,
      });

      showToast(`Task ${activeTask.complaint_code} marked as Resolved!`, 'success');
      setShowResolveModal(false);
      fetchTasks();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'ACTIVE') return !['Resolved', 'Verified/Closed'].includes(t.status);
    if (filter === 'Resolved') return ['Resolved', 'Verified/Closed'].includes(t.status);
    return t.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assigned Maintenance Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">
            Accept pending assignments, update repair progress, and upload completion proofs
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm shrink-0">
          {['ACTIVE', 'Assigned', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                filter === tab ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading assigned tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="There are currently no tasks matching this filter."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 transition ${
                task.priority === 'Urgent' ? 'border-rose-300 ring-2 ring-rose-200' : 'border-slate-200/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-slate-900">{task.complaint_code}</span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {task.description}
                </p>

                {/* Location & Resident Info */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="font-semibold">
                      {task.room ? `Block ${task.room.block} — Room ${task.room.room_number}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <User className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="truncate">{task.student?.name || 'Resident'}</span>
                  </div>
                </div>

                {task.student?.phone && (
                  <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 text-sky-900 font-semibold">
                    <span>Resident Phone: {task.student.phone}</span>
                    <a
                      href={`tel:${task.student.phone}`}
                      className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  to={`/student/complaints/${task.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Full Details <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-2">
                  {task.status === 'Assigned' && (
                    <button
                      onClick={() => handleAcceptTask(task.id)}
                      className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
                    >
                      Accept Job
                    </button>
                  )}
                  {task.status === 'In Progress' && (
                    <button
                      onClick={() => handleOpenResolveModal(task)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {['Resolved', 'Verified/Closed'].includes(task.status) && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Proof & Remarks Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title={`Complete Task: ${activeTask?.complaint_code}`}
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Submit your completion remarks and optional photo proof of repair. The resident and warden will be notified.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Work Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={resolveRemarks}
              onChange={(e) => setResolveRemarks(e.target.value)}
              placeholder="e.g. Cleared sink siphon blockage and replaced broken rubber gasket."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Completion Photo Proof (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setResolveFiles(files);
                setResolvePreviews(files.map((f) => URL.createObjectURL(f)));
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {resolvePreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {resolvePreviews.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="preview"
                    className="w-16 h-12 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {submitting ? 'Submitting Resolution...' : 'Mark as Fixed & Resolved'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

