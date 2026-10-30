import React, { useState, useEffect } from 'react';
import { technicianService } from '../../services/technicianService';
import { useNotification } from '../../context/NotificationContext';
import { Wrench, Phone, Mail, Star, CheckCircle, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminTechniciansPage = () => {
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchTechnicians = async () => {
    try {
      const res = await technicianService.getTechnicians();
      if (res.success && res.data) {
        setTechnicians(res.data);
      }
    } catch (err) {
      console.error('Failed to load technicians:', err);
      showToast('Failed to load technician roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Technicians Roster</h1>
        <p className="text-sm text-slate-500 mt-1">
          Monitor trade specializations, on-duty status, active job loads, and resident rating averages
        </p>
      </div>

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
  );
};

