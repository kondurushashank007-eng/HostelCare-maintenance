import React from 'react';
import { Clock, CheckCircle2, User, Wrench, AlertTriangle, MessageSquare } from 'lucide-react';

export const Timeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-400 italic">No activity recorded yet.</p>;
  }

  const getActionIcon = (action = '') => {
    const act = action.toLowerCase();
    if (act.includes('created') || act.includes('submitted')) return <Clock className="w-4 h-4 text-sky-500" />;
    if (act.includes('assigned')) return <User className="w-4 h-4 text-blue-500" />;
    if (act.includes('progress')) return <Wrench className="w-4 h-4 text-amber-500" />;
    if (act.includes('resolved') || act.includes('closed')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (act.includes('escalated')) return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    if (act.includes('feedback')) return <MessageSquare className="w-4 h-4 text-purple-500" />;
    return <Clock className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item, index) => (
        <div key={item.id || index} className="relative group">
          <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center group-hover:border-sky-500 transition-colors">
            {getActionIcon(item.action)}
          </div>
          <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 hover:border-slate-300 transition">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <span className="text-sm font-semibold text-slate-800">{item.action}</span>
              <span className="text-xs text-slate-400">
                {new Date(item.created_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            {item.performer && (
              <p className="text-xs text-slate-500 font-medium">
                By: {item.performer.name} ({item.performer_role || item.performer.role})
              </p>
            )}
            {item.remarks && (
              <p className="text-xs text-slate-600 mt-1.5 bg-white p-2 rounded-lg border border-slate-100">
                {item.remarks}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

