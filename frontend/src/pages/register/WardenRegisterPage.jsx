import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';

export const WardenRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    assignedBlock: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const hostelBlocks = [
    { value: 'Block A', label: 'Hostel Block A (Senior Residents)' },
    { value: 'Block B', label: 'Hostel Block B (Junior Residents)' },
    { value: 'Block C', label: 'Hostel Block C (Engineering Wing)' },
    { value: 'Block D', label: 'Hostel Block D (Postgraduate Wing)' },
    { value: 'All Blocks', label: 'All Hostel Blocks (Chief / General Supervision)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Please enter your official institutional email', 'warning');
      return;
    }

    if (!formData.phone.trim()) {
      showToast('Please enter your phone number', 'warning');
      return;
    }

    if (!formData.assignedBlock) {
      showToast('Please select your assigned hostel block', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please verify.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.registerWarden({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        assignedBlock: formData.assignedBlock,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success) {
        setSubmittedSuccess(true);
        showToast('Warden registration submitted for administrative verification!', 'success');
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Submission failed. Please check your inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Selection Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 mb-4">
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-400 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Type Selection</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl shadow-lg shadow-purple-500/30 mb-4">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Hostel Warden Registration</h2>
        <p className="mt-2 text-sm text-slate-400">
          Official registration for hostel wardens and administrative supervisors
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/70 sm:px-10">
          
          {submittedSuccess ? (
            /* Success & Verification Notice Screen */
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                  Pending Administrative Verification
                </span>
                <h3 className="text-xl font-bold text-white">Application Received!</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>. To safeguard student safety and hostel integrity, all warden registrations undergo verification before unrestricted administrator privileges are granted.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-left text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Official Email:</span>
                  <span className="font-mono text-white">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Jurisdiction:</span>
                  <span className="text-purple-300 font-semibold">{formData.assignedBlock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-amber-400 font-bold">Awaiting Chief Admin Approval</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/25 transition"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Security Policy Alert Banner */}
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-700/40 flex items-start gap-3 text-xs text-purple-200">
                <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Authorization & Approval Policy</span>
                  Warden accounts do not receive unrestricted administrator privileges automatically. New registrations are routed to the Chief Administrator for review prior to portal activation.
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Prof. S. K. Raman"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Official Email <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="warden.blocka@hostelcare.com"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98111 22334"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Assigned Hostel Block */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hostel Block Assigned <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Building className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <select
                    required
                    value={formData.assignedBlock}
                    onChange={(e) => setFormData({ ...formData, assignedBlock: e.target.value })}
                    className="w-full pl-11 pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition appearance-none"
                  >
                    <option value="" disabled>-- Select Assigned Hostel Block --</option>
                    {hostelBlocks.map((b) => (
                      <option key={b.value} value={b.value} className="bg-slate-900 text-white">
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password & Confirm Password Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      className={`w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-rose-500 focus:ring-rose-500'
                          : 'border-slate-700'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-[11px] text-rose-400">Passwords do not match</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/25 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application for Approval...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Warden Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an approved warden account?{' '}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

