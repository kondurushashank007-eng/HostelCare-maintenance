import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Shield, Wrench, GraduationCap, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'technician') navigate('/technician/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@hostelcare.com');
      setPassword('Admin@123');
    } else if (role === 'electrician') {
      setEmail('rajesh.electrician@hostelcare.com');
      setPassword('Tech@123');
    } else if (role === 'plumber') {
      setEmail('suresh.plumber@hostelcare.com');
      setPassword('Tech@123');
    } else if (role === 'student') {
      setEmail('rahul.sharma@hostel.edu');
      setPassword('Student@123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

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
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="resident@hostel.edu"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>One-Click Hackathon Demo Fill:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-300 text-xs font-medium hover:border-sky-500 hover:text-white transition"
              >
                <GraduationCap className="w-3.5 h-3.5 text-sky-400" /> Student
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-300 text-xs font-medium hover:border-purple-500 hover:text-white transition"
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" /> Warden / Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('electrician')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-300 text-xs font-medium hover:border-amber-500 hover:text-white transition"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" /> Electrician
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('plumber')}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900/70 border border-slate-700 text-slate-300 text-xs font-medium hover:border-blue-500 hover:text-white transition"
              >
                <Wrench className="w-3.5 h-3.5 text-blue-400" /> Plumber
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Resident student without an account?{' '}
            <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

