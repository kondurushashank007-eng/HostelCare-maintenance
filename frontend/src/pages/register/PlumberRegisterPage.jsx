import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import {
  User,
  Mail,
  Lock,
  Phone,
  BadgeAlert,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Droplets,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';

export const PlumberRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    assignedBlocks: ['Block B', 'Block C'],
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const { showToast } = useNotification();
  const navigate = useNavigate();

  const availableBlocks = ['Block A', 'Block B', 'Block C', 'Block D'];

  const toggleBlock = (block) => {
    setFormData((prev) => {
      const exists = prev.assignedBlocks.includes(block);
      if (exists) {
        if (prev.assignedBlocks.length === 1) {
          showToast('At least one assigned hostel block is required', 'warning');
          return prev;
        }
        return { ...prev, assignedBlocks: prev.assignedBlocks.filter((b) => b !== block) };
      }
      return { ...prev, assignedBlocks: [...prev.assignedBlocks, block] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Please enter your official email address', 'warning');
      return;
    }

    if (!formData.phone.trim()) {
      showToast('Please enter your phone number', 'warning');
      return;
    }

    if (!formData.employeeId.trim()) {
      showToast('Please enter your technical staff Employee ID', 'warning');
      return;
    }

    if (formData.assignedBlocks.length === 0) {
      showToast('Please select at least one assigned hostel block', 'warning');
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
      const res = await authService.registerTechnician({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        employeeId: formData.employeeId.trim(),
        assignedBlocks: formData.assignedBlocks,
        specialization: 'Plumbing',
        trade: 'Plumber',
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success) {
        setSubmittedSuccess(true);
        showToast('Plumber registration submitted for administrative verification!', 'success');
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
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Selection Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 mb-4">
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Type Selection</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-black text-2xl shadow-lg shadow-teal-500/30 mb-4">
          <Droplets className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Plumber Registration</h2>
        <p className="mt-2 text-sm text-slate-400">
          Maintenance staff registration for plumbing, sanitation, and water supply technicians
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/70 sm:px-10">
          
          {submittedSuccess ? (
            /* Success & Verification Notice Screen */
            <div className="text-center py-6 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-inner">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 mb-2">
                  Technical Staff Verification Pending
                </span>
                <h3 className="text-xl font-bold text-white">Application Logged!</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-white font-semibold">{formData.name}</span>. Your plumber registration with Employee ID <span className="font-mono text-teal-300 font-semibold">{formData.employeeId}</span> has been logged. The hostel maintenance office will activate your account once credentials are confirmed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-left text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Trade:</span>
                  <span className="text-teal-400 font-bold">Plumbing & Water Supply</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Employee ID:</span>
                  <span className="font-mono text-white">{formData.employeeId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Blocks:</span>
                  <span className="text-white">{formData.assignedBlocks.join(', ')}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Info banner */}
              <div className="p-3.5 rounded-2xl bg-teal-950/40 border border-teal-700/40 flex items-start gap-3 text-xs text-teal-200">
                <Briefcase className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block mb-0.5">Staff Verification Notice</span>
                  Plumber registrations are verified against the institution technician roster using your official Employee ID prior to job assignment enablement.
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
                    placeholder="Suresh Sharma"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
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
                      placeholder="suresh.plumber@hostelcare.com"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
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
                      placeholder="+91 98222 33445"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Employee ID <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <BadgeAlert className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    placeholder="EMP-PLUM-201"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Assigned Hostel Blocks */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Assigned Hostel Blocks <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {availableBlocks.map((block) => {
                    const isSelected = formData.assignedBlocks.includes(block);
                    return (
                      <button
                        key={block}
                        type="button"
                        onClick={() => toggleBlock(block)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-teal-500/20 border-teal-500 text-teal-300 shadow-sm'
                            : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />}
                        <span>{block}</span>
                      </button>
                    );
                  })}
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
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
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
                      className={`w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 shadow-lg shadow-teal-500/25 transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Technical Registration...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Plumber Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered as technical staff?{' '}
            <Link to="/login" className="font-semibold text-teal-400 hover:text-teal-300 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

