import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Shield,
  Zap,
  Droplets,
  HelpCircle,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const LoginPage = () => {
  // Login fields strictly initialized as empty strings
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [activePortalHint, setActivePortalHint] = useState('all');

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const portalRoles = [
    { id: 'all', label: 'All Roles', icon: null },
    { id: 'student', label: 'Student', icon: <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'warden', label: 'Warden', icon: <Shield className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'electrician', label: 'Electrician', icon: <Zap className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'plumber', label: 'Plumber', icon: <Droplets className="w-3.5 h-3.5 text-teal-400" /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both your email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const user = await login({ email: email.trim(), password });
      showToast(`Welcome back, ${user.name}!`, 'success');

      // Authoritative server-side role redirection
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'technician') {
        navigate('/technician/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed. Please verify your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white font-black text-2xl shadow-lg shadow-sky-500/30 mb-4">
          H
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">HostelCare</h2>
        <p className="mt-2 text-sm text-slate-400">
          Smart Hostel Complaint & Maintenance Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/70 sm:px-10">
          
          {/* Role Portal Selector Banner */}
          <div className="mb-6">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Portal Access Sign In
            </span>
            <div className="flex items-center justify-center gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-700/80 overflow-x-auto">
              {portalRoles.map((portal) => (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => setActivePortalHint(portal.id)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                    activePortalHint === portal.id
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {portal.icon}
                  <span>{portal.label}</span>
                </button>
              ))}
            </div>
            {activePortalHint !== 'all' && (
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Signing in as <span className="text-sky-300 font-semibold capitalize">{activePortalHint}</span>. Your portal is determined automatically by your verified credentials.
              </p>
            )}
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit} autoComplete="on">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password with Show/Hide toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-xs font-medium text-sky-400 hover:text-sky-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-200 transition p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Selection Hub Link */}
          <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-xs text-slate-400 mb-3">
              Don't have an active account yet?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-semibold text-xs transition"
            >
              <span>Create New Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl max-w-md w-full p-6 text-slate-200 relative">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Password Recovery</h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              To protect student and hostel records, account credentials cannot be reset unverified. Please follow the instructions for your account role:
            </p>

            <div className="space-y-3 text-xs mb-6">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <span className="font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-4 h-4 text-sky-400" /> Resident Students
                </span>
                <p className="text-slate-400">
                  Visit the Hostel Warden Office with your Student ID card or ask your Block Warden to trigger a temporary password reset.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <span className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                  <Shield className="w-4 h-4 text-purple-400" /> Wardens & Technical Staff
                </span>
                <p className="text-slate-400">
                  Contact the Chief Hostel Administrator at <span className="text-white font-mono">admin@hostelcare.com</span> with your registered Employee ID.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition"
            >
              Understood, Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
