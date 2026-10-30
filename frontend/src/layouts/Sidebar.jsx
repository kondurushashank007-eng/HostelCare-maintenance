import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  ListTodo,
  User,
  Users,
  Bot,
  BarChart3,
  CheckSquare,
  History,
  X,
  Sparkles,
  Shield,
  Wrench,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/student/complaints/new', label: 'Lodge Complaint', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/student/complaints', label: 'My Complaints', icon: <ListTodo className="w-4 h-4" /> },
    { to: '/student/profile', label: 'Resident Profile', icon: <User className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/complaints', label: 'All Complaints', icon: <ListTodo className="w-4 h-4" /> },
    { to: '/admin/technicians', label: 'Technicians', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/ai-assistant', label: 'AI Maintenance Copilot', icon: <Bot className="w-4 h-4 text-sky-500" /> },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const technicianLinks = [
    { to: '/technician/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/technician/tasks', label: 'Assigned Work', icon: <CheckSquare className="w-4 h-4" /> },
    { to: '/technician/history', label: 'Resolved History', icon: <History className="w-4 h-4" /> },
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'technician'
      ? technicianLinks
      : studentLinks;

  const getPortalTitle = () => {
    if (role === 'admin') return 'Warden Administration';
    if (role === 'technician') return 'Technician Workdesk';
    return 'Resident Portal';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-30 shrink-0`}
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white flex items-center justify-center font-black shadow-md shadow-sky-500/20 text-sm">
              H
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-sm">HostelCare</span>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                {getPortalTitle()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3.5 space-y-1 flex-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* AI Badge Banner in Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-gradient-to-r from-sky-950 to-slate-900 border border-sky-800/40 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-sky-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Gemini AI Engine</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug">
              Auto-triage, priority classification, duplicate checks & copilot enabled.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

