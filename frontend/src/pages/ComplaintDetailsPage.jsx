import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { complaintService } from '../services/complaintService';
import { technicianService } from '../services/technicianService';
import { feedbackService } from '../services/feedbackService';
import { uploadService } from '../services/uploadService';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Timeline } from '../components/Timeline';
import { AiAnalysisCard } from '../components/AiAnalysisCard';
import { Modal } from '../components/Modal';
import {
  Building2,
  User,
  Phone,
  Wrench,
  Clock,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Star,
  Upload,
  UserCheck,
  AlertOctagon,
  ArrowLeft,
  X,
} from 'lucide-react';

export const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Form states for modals
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [assignPriority, setAssignPriority] = useState('');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [newPriority, setNewPriority] = useState('Medium');
  const [priorityRemarks, setPriorityRemarks] = useState('');

  const [resolveRemarks, setResolveRemarks] = useState('');
  const [resolveFiles, setResolveFiles] = useState([]);
  const [resolveFilePreviews, setResolveFilePreviews] = useState([]);

  const [reopenReason, setReopenReason] = useState('');

  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.data) {
        setComplaint(res.data);
        setNewPriority(res.data.priority);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Load technicians when admin opens assign modal
  const handleOpenAssignModal = async () => {
    try {
      const res = await technicianService.getTechnicians();
      if (res.success && res.data) {
        setTechnicians(res.data);
        if (res.data.length > 0) {
          setSelectedTechId(res.data[0].id);
        }
      }
      setAssignPriority(complaint?.priority || 'Medium');
      setShowAssignModal(true);
    } catch (err) {
      showToast('Failed to load technician directory', 'error');
    }
  };

  // Admin assigns technician
  const handleAssignTechnician = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await complaintService.assignTechnician(id, {
        technicianId: selectedTechId,
        priority: assignPriority,
        remarks: assignRemarks,
      });
      showToast('Technician assigned successfully', 'success');
      setShowAssignModal(false);
      fetchComplaintDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Admin updates priority
  const handleUpdatePriority = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await complaintService.updatePriority(id, {
        priority: newPriority,
        remarks: priorityRemarks,
      });
      showToast('Priority updated successfully', 'success');
      setShowPriorityModal(false);
      fetchComplaintDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Technician accepts task (Assigned -> In Progress)
  const handleAcceptJob = async () => {
    setActionLoading(true);
    try {
      await complaintService.updateStatus(id, {
        status: 'In Progress',
        remarks: `Technician ${user?.name} acknowledged task and started repair.`,
      });
      showToast('Job marked In Progress', 'success');
      fetchComplaintDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Technician marks resolved
  const handleMarkResolved = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      let resolutionImages = [];
      if (resolveFiles.length > 0) {
        const uploadRes = await uploadService.uploadImages(resolveFiles);
        if (uploadRes.success && uploadRes.data?.urls) {
          resolutionImages = uploadRes.data.urls;
        }
      }

      await complaintService.updateStatus(id, {
        status: 'Resolved',
        remarks: resolveRemarks || 'Maintenance repair completed successfully.',
        resolutionImages,
      });
      showToast('Task marked as Resolved!', 'success');
      setShowResolveModal(false);
      fetchComplaintDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Student reopens complaint
  const handleReopen = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await complaintService.reopenComplaint(id, { reason: reopenReason });
      showToast('Complaint reopened and escalated to warden', 'warning');
      setShowReopenModal(false);
      fetchComplaintDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Student submits feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await feedbackService.submitFeedback(id, {
        rating,
        comments: feedbackComment,
      });
      showToast('Thank you for rating our maintenance service!', 'success');
      setShowFeedbackModal(false);
      fetchComplaintDetails();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-slate-400">
        Loading complaint details & audit timeline...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Complaint Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isResolvedOrClosed = ['Resolved', 'Verified/Closed'].includes(complaint.status);
  const isAssigned = complaint.status === 'Assigned';
  const isInProgress = complaint.status === 'In Progress';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs text-slate-400">
          Created: {new Date(complaint.created_at).toLocaleString()}
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-black text-slate-900 tracking-wide">
              {complaint.complaint_code}
            </span>
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              {complaint.category}
            </span>
          </div>

          {/* Action Buttons based on Role */}
          <div className="flex flex-wrap items-center gap-2">
            {role === 'admin' && (
              <>
                <button
                  onClick={handleOpenAssignModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  {complaint.assigned_technician_id ? 'Reassign Tech' : 'Assign Tech'}
                </button>
                <button
                  onClick={() => setShowPriorityModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Set Priority
                </button>
              </>
            )}

            {role === 'technician' && (
              <>
                {isAssigned && (
                  <button
                    onClick={handleAcceptJob}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition"
                  >
                    <Wrench className="w-3.5 h-3.5" /> Accept Job / Start Work
                  </button>
                )}
                {isInProgress && (
                  <button
                    onClick={() => setShowResolveModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Resolved
                  </button>
                )}
              </>
            )}

            {role === 'student' && isResolvedOrClosed && (
              <>
                {!complaint.feedback && (
                  <button
                    onClick={() => setShowFeedbackModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" /> Rate & Review
                  </button>
                )}
                <button
                  onClick={() => setShowReopenModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reopen Issue
                </button>
              </>
            )}
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{complaint.title}</h1>
        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          {complaint.description}
        </p>

        {/* Uploaded Complaint Images */}
        {complaint.images && complaint.images.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Resident Photographs ({complaint.images.length})
            </span>
            <div className="flex flex-wrap gap-3">
              {complaint.images.map((imgUrl, i) => (
                <a
                  key={i}
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl overflow-hidden border border-slate-200 hover:scale-105 transition shadow-sm w-28 h-20 bg-slate-100 block"
                >
                  <img src={imgUrl} alt="Complaint detail" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Photos (if completed by technician) */}
        {complaint.resolution_images && complaint.resolution_images.length > 0 && (
          <div className="space-y-2 pt-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Technician Resolution Proof ({complaint.resolution_images.length})
            </span>
            <div className="flex flex-wrap gap-3">
              {complaint.resolution_images.map((imgUrl, i) => (
                <a
                  key={i}
                  href={imgUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl overflow-hidden border border-emerald-200 hover:scale-105 transition shadow-sm w-28 h-20 bg-emerald-100 block"
                >
                  <img src={imgUrl} alt="Resolution proof" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2 Column Details: Left (Room, Student, Tech, AI), Right (Timeline & Feedback) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & AI */}
        <div className="space-y-6 lg:col-span-1">
          {/* Room & Resident Info Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Location & Resident
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-semibold">
                  {complaint.room
                    ? `Block ${complaint.room.block} — Room ${complaint.room.room_number} (Floor ${complaint.room.floor})`
                    : 'Room not specified'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <User className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Resident: {complaint.student?.name || 'Student'}</span>
              </div>
              {complaint.student?.phone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>{complaint.student.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Assigned Maintenance Technician
            </h4>
            {complaint.technician ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {complaint.technician.user?.name || 'Technician'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold text-[10px] border border-sky-200">
                    {complaint.technician.specialization}
                  </span>
                </div>
                {complaint.technician.user?.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{complaint.technician.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs pt-1">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{complaint.technician.rating_average || 5.0} Rating</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                No technician assigned yet. Warden triage pending.
              </div>
            )}
          </div>

          {/* AI Analysis Card */}
          {complaint.ai_analysis && <AiAnalysisCard analysis={complaint.ai_analysis} />}
        </div>

        {/* Right Column: History Timeline & Student Review */}
        <div className="space-y-6 lg:col-span-2">
          {/* Feedback Card if given */}
          {complaint.feedback && (
            <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/30 p-5 rounded-3xl border border-amber-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  Resident Feedback & Rating
                </span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= complaint.feedback.rating ? 'fill-current' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-amber-100">
                "{complaint.feedback.comments || 'No written comment left.'}"
              </p>
            </div>
          )}

          {/* History Timeline */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">Status History & Audit Trail</h3>
                <p className="text-xs text-slate-400">Timestamped record of every action and remark</p>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>

            <Timeline history={complaint.history} />
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Admin Assign Technician Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Maintenance Technician"
      >
        <form onSubmit={handleAssignTechnician} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Qualified Technician
            </label>
            <select
              value={selectedTechId}
              onChange={(e) => setSelectedTechId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user?.name} — {t.specialization} ({t.active_tasks_count} active tasks, ★ {t.rating_average})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm or Modify Priority
            </label>
            <select
              value={assignPriority}
              onChange={(e) => setAssignPriority(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Warden Dispatch Remarks (Optional)
            </label>
            <textarea
              rows={3}
              value={assignRemarks}
              onChange={(e) => setAssignRemarks(e.target.value)}
              placeholder="e.g. Please bring extra 10A fuse and safety meter."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500 transition shadow-md shadow-sky-600/20"
          >
            {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </form>
      </Modal>

      {/* Admin Modify Priority Modal */}
      <Modal
        isOpen={showPriorityModal}
        onClose={() => setShowPriorityModal(false)}
        title="Override Priority Level"
      >
        <form onSubmit={handleUpdatePriority} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Priority
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason / Remarks
            </label>
            <textarea
              rows={3}
              value={priorityRemarks}
              onChange={(e) => setPriorityRemarks(e.target.value)}
              placeholder="e.g. Elevating to Urgent due to student exams."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 text-white font-bold text-sm hover:bg-sky-500 transition shadow-md shadow-sky-600/20"
          >
            {actionLoading ? 'Updating...' : 'Save Priority'}
          </button>
        </form>
      </Modal>

      {/* Technician Mark Resolved Modal */}
      <Modal
        isOpen={showResolveModal}
        onClose={() => setShowResolveModal(false)}
        title="Mark Task as Resolved"
      >
        <form onSubmit={handleMarkResolved} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Maintenance Completion Remarks
            </label>
            <textarea
              required
              rows={3}
              value={resolveRemarks}
              onChange={(e) => setResolveRemarks(e.target.value)}
              placeholder="Describe what was fixed (e.g. Replaced burnt capacitor and tightened wiring)..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Completion Proof Photos (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setResolveFiles(files);
                setResolveFilePreviews(files.map((f) => URL.createObjectURL(f)));
              }}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {resolveFilePreviews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {resolveFilePreviews.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt="resolved preview"
                    className="w-16 h-12 rounded-lg object-cover border"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition shadow-md shadow-emerald-600/20"
          >
            {actionLoading ? 'Saving...' : 'Mark as Fixed & Resolved'}
          </button>
        </form>
      </Modal>

      {/* Student Reopen Modal */}
      <Modal
        isOpen={showReopenModal}
        onClose={() => setShowReopenModal(false)}
        title="Reopen Unresolved Complaint"
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <p className="text-xs text-slate-600">
            If the problem was not solved adequately or recurred, please explain what is still broken. The ticket will be immediately escalated to the Hostel Warden.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Reopening <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The tap is still leaking from the main valve..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-500 transition shadow-md shadow-rose-600/20"
          >
            {actionLoading ? 'Reopening...' : 'Reopen Complaint'}
          </button>
        </form>
      </Modal>

      {/* Student Feedback & Rating Modal */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="Rate Maintenance Service"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-center">
          <p className="text-xs text-slate-500">
            How satisfied are you with the speed and quality of this repair?
          </p>

          <div className="flex justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className="p-1 text-amber-400 hover:scale-125 transition"
              >
                <Star
                  className={`w-8 h-8 ${s <= rating ? 'fill-amber-400' : 'text-slate-200'}`}
                />
              </button>
            ))}
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Feedback Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Share your experience with the technician..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={actionLoading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-400 transition shadow-md shadow-amber-500/20"
          >
            {actionLoading ? 'Submitting...' : 'Submit Rating'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

