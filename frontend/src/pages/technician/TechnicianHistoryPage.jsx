import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityBadge } from '../../components/PriorityBadge';
import { EmptyState } from '../../components/EmptyState';
import { CheckCircle2, Star, Clock, Building2, Calendar } from 'lucide-react';

export const TechnicianHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await complaintService.getComplaints();
        if (res.success && res.data) {
          const resolvedOnly = res.data.filter((c) =>
            ['Resolved', 'Verified/Closed'].includes(c.status)
          );
          setHistory(resolvedOnly);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resolved Work History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Archive of maintenance tickets completed by you with student ratings
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading work history...</div>
      ) : history.length === 0 ? (
        <EmptyState
          title="No resolved tickets yet"
          description="Completed maintenance tickets will appear here with student ratings."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{item.complaint_code}</span>
                  <StatusBadge status={item.status} />
                  <PriorityBadge priority={item.priority} />
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Resolved: {item.resolved_at ? new Date(item.resolved_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {item.description}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  <span>
                    {item.room ? `Block ${item.room.block} — Room ${item.room.room_number}` : 'Room N/A'}
                  </span>
                  <span>•</span>
                  <span>Resident: {item.student?.name}</span>
                </div>

                {item.feedback ? (
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 text-amber-800 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.feedback.rating} / 5 Stars</span>
                    {item.feedback.comments && (
                      <span className="text-slate-500 font-normal italic ml-1">
                        "{item.feedback.comments}"
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No resident review submitted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

