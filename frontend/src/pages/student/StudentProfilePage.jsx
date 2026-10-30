import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { User, Mail, Phone, Building2, Save, Shield } from 'lucide-react';

export const StudentProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useNotification();

  const [phone, setPhone] = useState(user?.phone || '');
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile({ name, phone });
      if (res.success) {
        updateUserProfile({ name, phone });
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resident Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal contact details and hostel room allocation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 mb-4">
            {user?.name ? user.name[0] : 'U'}
          </div>
          <h3 className="text-lg font-bold text-slate-900">{user?.name}</h3>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <span className="mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            Hostel Resident
          </span>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
              <span>
                {user?.room ? `Block ${user.room.block} — Room ${user.room.room_number}` : 'Room unassigned'}
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Phone className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{user?.phone || 'No phone added'}</span>
            </div>
          </div>
        </div>

        {/* Update Form & Room Details */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Contact Information
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Email (Read Only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (for technician coordination)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* Room Allocation Info Box */}
          <div className="bg-sky-50/70 p-5 rounded-3xl border border-sky-100 flex items-start gap-3.5">
            <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-950 space-y-1">
              <h4 className="font-bold">Room Change Procedure</h4>
              <p className="text-sky-800 leading-relaxed">
                Room allocations are managed centrally by the Hostel Warden. If you have officially shifted rooms, please request the warden desk to update your room record in the administrative portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

