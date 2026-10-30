import React from 'react';
import { AlertCircle, AlertTriangle, ArrowDown, Flame } from 'lucide-react';

export const PriorityBadge = ({ priority }) => {
  const configs = {
    Low: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <ArrowDown className="w-3.5 h-3.5" />,
    },
    Medium: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    High: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
    },
    Urgent: {
      bg: 'bg-rose-50 text-rose-800 border-rose-300 font-extrabold ring-1 ring-rose-400',
      icon: <Flame className="w-3.5 h-3.5 text-rose-600 animate-bounce" />,
    },
  };

  const current = configs[priority] || configs.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${current.bg}`}
    >
      {current.icon}
      {priority}
    </span>
  );
};

