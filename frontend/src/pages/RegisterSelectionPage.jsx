import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  Zap,
  Droplets,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export const RegisterSelectionPage = () => {
  const navigate = useNavigate();

  const accountTypes = [
    {
      id: 'student',
      title: 'Student Registration',
      subtitle: 'Resident Student Account',
      badge: 'Instant Activation',
      badgeColor: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      description:
        'For college hostel residents. Register with your allotted block and room number to submit maintenance tickets, upload photos, track resolution in real time, and rate service quality.',
      features: [
        'Room-specific ticket lodging',
        'AI triage & automated priority',
        'Live resolution tracker',
        'Direct feedback rating',
      ],
      icon: <GraduationCap className="w-8 h-8 text-sky-400" />,
      iconBg: 'bg-sky-500/10 border-sky-500/30',
      hoverBorder: 'hover:border-sky-500/60',
      buttonBg: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-sky-500/20',
      route: '/register/student',
    },
    {
      id: 'warden',
      title: 'Warden Registration',
      subtitle: 'Hostel Administration',
      badge: 'Admin Review Required',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description:
        'For hostel block wardens and administrative supervisors. Oversee complaints across your assigned blocks, dispatch trade technicians, and review AI recommendations.',
      features: [
        'Hostel block supervision',
        'Technician assignment & triage',
        'Escalated hazard management',
        'Analytics & performance reports',
      ],
      icon: <Shield className="w-8 h-8 text-purple-400" />,
      iconBg: 'bg-purple-500/10 border-purple-500/30',
      hoverBorder: 'hover:border-purple-500/60',
      buttonBg: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/20',
      route: '/register/warden',
    },
    {
      id: 'electrician',
      title: 'Electrician Registration',
      subtitle: 'Electrical Maintenance Trade',
      badge: 'Employee ID Verification',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description:
        'For certified maintenance electricians. Receive assigned electrical repair tasks, update on-site job progress, log repair remarks, and mark electrical complaints as resolved.',
      features: [
        'Electrical ticket workdesk',
        'Room-wise fault diagnostic details',
        'Status updates (Assigned → Resolved)',
        'Completion remarks & records',
      ],
      icon: <Zap className="w-8 h-8 text-amber-400" />,
      iconBg: 'bg-amber-500/10 border-amber-500/30',
      hoverBorder: 'hover:border-amber-500/60',
      buttonBg: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-amber-500/20',
      route: '/register/electrician',
    },
    {
      id: 'plumber',
      title: 'Plumber Registration',
      subtitle: 'Plumbing & Water Supply Trade',
      badge: 'Employee ID Verification',
      badgeColor: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      description:
        'For certified plumbing and sanitation technicians. Address pipeline leakages, washbasin fittings, bathroom fixtures, and water tank emergency complaints.',
      features: [
        'Plumbing ticket workdesk',
        'Bathroom & pipeline leak logs',
        'On-duty availability toggle',
        'Resolved job history tracking',
      ],
      icon: <Droplets className="w-8 h-8 text-teal-400" />,
      iconBg: 'bg-teal-500/10 border-teal-500/30',
      hoverBorder: 'hover:border-teal-500/60',
      buttonBg: 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-teal-500/20',
      route: '/register/plumber',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white font-black text-2xl shadow-lg shadow-sky-500/30 mb-4">
            H
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Account Type
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Select your dedicated role below to register with HostelCare and access your specialized portal
          </p>
        </div>

        {/* 4 Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accountTypes.map((card) => (
            <div
              key={card.id}
              className={`bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-700/80 shadow-2xl flex flex-col justify-between transition duration-200 ${card.hoverBorder} group hover:-translate-y-1`}
            >
              <div>
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${card.iconBg} shadow-inner`}
                  >
                    {card.icon}
                  </div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  {card.subtitle}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-5">
                  {card.description}
                </p>

                {/* Key features bullets */}
                <div className="space-y-2 mb-6 pt-4 border-t border-slate-700/60">
                  {card.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => navigate(card.route)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition ${card.buttonBg}`}
                >
                  <span>Register as {card.id.charAt(0).toUpperCase() + card.id.slice(1)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center text-xs text-slate-400">
          Already have an existing HostelCare account?{' '}
          <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 underline">
            Sign In to your portal
          </Link>
        </div>
      </div>
    </div>
  );
};

