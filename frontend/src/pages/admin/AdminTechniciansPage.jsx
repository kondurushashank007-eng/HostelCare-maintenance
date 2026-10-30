import React, { useState, useEffect } from 'react';
import { technicianService } from '../../services/technicianService';
import { authService } from '../../services/authService';
import { useNotification } from '../../context/NotificationContext';
import {
  Wrench,
  Phone,
  Mail,
  Star,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Droplets,
  UserCheck,
  AlertCircle,
  BadgeAlert,
} from 'lucide-react';

export const AdminTechniciansPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const { showToast } = useNotification();

  const fetchData = async () => {
    try {
      const [techRes, staffRes] = await Promise.allSettled([
        technicianService.getTechnicians(),
        authService.getPendingStaff(),
      ]);

      if (techRes.status === 'fulfilled' && techRes.value.success) {
        setTechnicians(techRes.value.data || []);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value.success) {
        setPendingStaff(staffRes.value.data || []);
      }
    } catch (err) {
      console.error('Failed to load roster data:', err);
      showToast('Failed to load roster data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await technicianService.updateAvailability(id, !currentStatus);
      setTechnicians((prev) =>
        prev.map((t) => (t.id === id ? { ...t, is_available: !currentStatus } : t))
      );
      showToast('Technician availability updated', 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleApproveStaff = async (staffId, staffName) => {
    setApprovingId(staffId);
    try {
      const res = await authService.approveStaff(staffId);
      if (res.success) {
        showToast(`Staff member '${staffName}' approved successfully!`, 'success');
        setPendingStaff((prev) => prev.filter((s) => s.id !== staffId));
        // Refresh technicians roster in case an approved technician is now available
        fetchData();
      } else {
        showToast(res.message || 'Approval failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Approval request failed', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff & Technicians Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review pending staff registrations, monitor trade specializations, on-duty status, and resident rating averages
        </p>
      </div>

      {/* Pending Staff Review Section */}
      {pendingStaff.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pending Staff Verifications ({pendingStaff.length})
              </h2>
              <p className="text-xs text-slate-600">
                New staff registrations awaiting administrator approval before portal access is enabled
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-2xl p-4 border border-amber-200 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                      {staff.designation || staff.role}
                    </span>
                    {staff.employeeId && staff.employeeId !== 'N/A' && (
                      <span className="text-[11px] font-mono font-semibold text-slate-500">
                        {staff.employeeId}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{staff.name}</h3>
                  <div className="text-xs text-slate-500 space-y-1 mt-1.5">
                    <div className="truncate">{staff.email}</div>
                    {staff.phone && <div>{staff.phone}</div>}
                    {staff.assignedBlocks && staff.assignedBlocks.length > 0 && (
                      <div className="text-[11px] text-sky-700 font-medium">
                        Blocks: {staff.assignedBlocks.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={approvingId === staff.id}
                  onClick={() => handleApproveStaff(staff.id, staff.name)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{approvingId === staff.id ? 'Approving...' : 'Approve & Enable Access'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Technicians Roster */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Active Maintenance Fleet</h2>
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Loading technician fleet...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {technicians.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleToggleAvailability(t.id, t.is_available)}
                      className="flex items-center gap-1 text-xs font-semibold"
                      title="Click to toggle availability"
                    >
                      {t.is_available ? (
                        <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Available
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                          Off-Duty
                        </span>
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{t.user?.name || 'Technician'}</h3>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-100">
                    {t.specialization}
                  </span>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    {t.user?.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.user.phone}</span>
                      </div>
                    )}
                    {t.user?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{t.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Active Jobs</span>
                    <span className="text-sm font-bold text-slate-800">{t.active_tasks_count || 0}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Rating</span>
                    <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {t.rating_average || 5.0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
