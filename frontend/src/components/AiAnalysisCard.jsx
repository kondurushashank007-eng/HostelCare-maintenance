import React from 'react';
import { Sparkles, AlertTriangle, ShieldAlert, Cpu, Wrench, CheckCircle } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';

export const AiAnalysisCard = ({ analysis }) => {
  if (!analysis) return null;

  const isGemini = analysis.source === 'gemini-ai';

  return (
    <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/30 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/20">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              Gemini AI Complaint Analysis
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                {isGemini ? 'GenAI Powered' : 'Rule-Based Fallback'}
              </span>
            </h4>
            <p className="text-xs text-slate-500">Automated triage & prioritization</p>
          </div>
        </div>
        {analysis.confidence && (
          <span className="text-xs font-semibold text-slate-500">
            Confidence: {Math.round(analysis.confidence * 100)}%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="bg-white/80 p-3 rounded-xl border border-sky-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Suggested Priority
          </span>
          <PriorityBadge priority={analysis.priority_suggested || 'Medium'} />
        </div>

        <div className="bg-white/80 p-3 rounded-xl border border-sky-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Suggested Trade / Tech
          </span>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Wrench className="w-3.5 h-3.5 text-sky-600" />
            {analysis.suggested_specialization || 'General Maintenance'}
          </div>
        </div>
      </div>

      {analysis.summary && (
        <div className="bg-white/80 p-3 rounded-xl border border-sky-100 mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Concise Executive Summary
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{analysis.summary}</p>
        </div>
      )}

      {analysis.urgency_flags && analysis.urgency_flags.length > 0 && (
        <div className="mb-3 space-y-1">
          {analysis.urgency_flags.map((flag, i) => (
            <div
              key={i}
              className="flex items-center gap-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{flag}</span>
            </div>
          ))}
        </div>
      )}

      {analysis.duplicate_detection?.is_potential_duplicate && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <div className="flex items-center gap-2 font-bold mb-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Potential Duplicate Detected ({analysis.duplicate_detection.matches.length})</span>
          </div>
          <ul className="space-y-1.5 pl-6 list-disc text-amber-800 font-medium">
            {analysis.duplicate_detection.matches.map((m, idx) => (
              <li key={idx}>
                <strong>{m.complaint_code}</strong>: {m.title} ({m.status}) - {m.similarity_score}% similarity.
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

