import React from 'react';
import { Clock, CheckCircle2, UserCheck, Wrench, RefreshCw, AlertOctagon, CheckCheck } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const configs = {
    Submitted: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    Pending: {
      bg: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    Assigned: {
      bg: 'bg-sky-100 text-sky-800 border-sky-300',
      icon: <UserCheck className="w-3.5 h-3.5" />,
    },
    'In Progress': {
      bg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <Wrench className="w-3.5 h-3.5 animate-pulse" />,
    },
    Resolved: {
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    'Verified/Closed': {
      bg: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: <CheckCheck className="w-3.5 h-3.5" />,
    },
    Reopened: {
      bg: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    Escalated: {
      bg: 'bg-rose-100 text-rose-800 border-rose-300 ring-2 ring-rose-400 ring-offset-1 animate-pulse',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />,
    },
  };

  const current = configs[status] || configs.Submitted;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}
    >
      {current.icon}
      {status}
    </span>
  );
};

