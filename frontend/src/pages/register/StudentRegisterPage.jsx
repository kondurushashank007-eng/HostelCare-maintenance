import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const StudentRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roomId: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setRoomsLoading(true);
    setRoomsError(null);
    try {
      const res = await authService.getRooms();
      if (res.success && Array.isArray(res.data)) {
        setRooms(res.data);
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('Failed to load hostel rooms:', err);
      setRoomsError(err.message || 'Failed to load available hostel rooms from server');
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Group rooms by block for structured presentation
  const groupedRooms = rooms.reduce((acc, room) => {
    const blockKey = room.block || 'Other';
    if (!acc[blockKey]) acc[blockKey] = [];
    acc[blockKey].push(room);
    return acc;
  }, {});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast('Please enter your full name', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      showToast('Please enter your college email', 'warning');
      return;
    }

    // Strict room validation
    if (!formData.roomId || formData.roomId.trim() === '') {
      showToast('Please select your hostel block and room number', 'warning');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters long', 'warning');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match. Please re-enter.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authService.registerStudent({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        roomId: formData.roomId,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (res.success && res.data) {
        // Log in immediately with generated token
        localStorage.setItem('hostelcare_token', res.data.token);
        localStorage.setItem('hostelcare_user', JSON.stringify(res.data.user));
        showToast(`Registration successful! Welcome to HostelCare, ${res.data.user.name}.`, 'success');
        navigate('/student/dashboard');
      } else {
        showToast(res.message || 'Registration failed', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please check your inputs.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient backgrounds */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Selection Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 mb-4">
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sky-400 font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Account Type Selection</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center z-10 px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-400 text-white font-black text-2xl shadow-lg shadow-sky-500/30 mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Student Resident Registration</h2>
        <p className="mt-2 text-sm text-slate-400">
          Register with your allotted hostel room to submit complaints and track maintenance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-slate-700/70 sm:px-10">
          <form className="space-y-4" onSubmit={handleSubmit}>
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
                  placeholder="Rahul Sharma"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  College Email <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@hostel.edu"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Hostel Block & Room Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Hostel Block & Room <span className="text-rose-400">*</span>
                </label>
                {roomsLoading && (
                  <span className="flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Loading rooms...
                  </span>
                )}
                {!roomsLoading && rooms.length > 0 && (
                  <span className="text-[11px] text-slate-400">
                    {rooms.length} rooms available
                  </span>
                )}
              </div>

              <div className="relative">
                <Building2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
                <select
                  required
                  disabled={roomsLoading || rooms.length === 0}
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className={`w-full pl-11 pr-8 py-2.5 rounded-xl bg-slate-900/80 border text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition appearance-none ${
                    roomsError
                      ? 'border-rose-500/80 text-rose-300'
                      : !formData.roomId
                      ? 'border-slate-700 text-slate-400'
                      : 'border-slate-700 text-white'
                  }`}
                >
                  <option value="" disabled>
                    {roomsLoading
                      ? 'Loading hostel rooms from database...'
                      : roomsError
                      ? 'Error loading rooms — click Retry below'
                      : rooms.length === 0
                      ? 'No rooms available — contact warden'
                      : '-- Select Your Block & Room --'}
                  </option>

                  {Object.entries(groupedRooms).map(([block, blockRooms]) => (
                    <optgroup
                      key={block}
                      label={`Block ${block} (${blockRooms.length} rooms)`}
                      className="bg-slate-900 text-sky-300 font-bold"
                    >
                      {blockRooms.map((room) => (
                        <option
                          key={room.id}
                          value={room.id}
                          className="bg-slate-900 text-white font-normal"
                        >
                          Block {room.block} — Room {room.room_number} (Floor {room.floor}, {room.capacity || 2} Beds)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Error state message with retry button */}
              {roomsError && (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span className="truncate">{roomsError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchRooms}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold shrink-0 transition"
                  >
                    <RefreshCw className="w-3 h-3" /> Retry
                  </button>
                </div>
              )}

              {/* Empty state message */}
              {!roomsLoading && !roomsError && rooms.length === 0 && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>No hostel rooms registered in system. Please notify the administrator.</span>
                </div>
              )}
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
                    className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
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
                    className={`w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition ${
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
              disabled={submitting || roomsLoading || rooms.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Student Account...</span>
                </>
              ) : (
                <>
                  <span>Create Resident Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

