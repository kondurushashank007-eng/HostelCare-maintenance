import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth & Registration Hub Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterSelectionPage } from '../pages/RegisterSelectionPage';
import { StudentRegisterPage } from '../pages/register/StudentRegisterPage';
import { WardenRegisterPage } from '../pages/register/WardenRegisterPage';
import { ElectricianRegisterPage } from '../pages/register/ElectricianRegisterPage';
import { PlumberRegisterPage } from '../pages/register/PlumberRegisterPage';

// Shared Detail View
import { ComplaintDetailsPage } from '../pages/ComplaintDetailsPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { SubmitComplaintPage } from '../pages/student/SubmitComplaintPage';
import { StudentComplaintsPage } from '../pages/student/StudentComplaintsPage';
import { StudentProfilePage } from '../pages/student/StudentProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminComplaintsPage } from '../pages/admin/AdminComplaintsPage';
import { AdminTechniciansPage } from '../pages/admin/AdminTechniciansPage';
import { AdminAiAssistantPage } from '../pages/admin/AdminAiAssistantPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';

// Technician Pages
import { TechnicianDashboard } from '../pages/technician/TechnicianDashboard';
import { TechnicianTasksPage } from '../pages/technician/TechnicianTasksPage';
import { TechnicianHistoryPage } from '../pages/technician/TechnicianHistoryPage';

export const AppRoutes = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span>Initializing HostelCare Portal...</span>
        </div>
      </div>
    );
  }

  const getHomeRedirect = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'technician') return '/technician/dashboard';
    return '/student/dashboard';
  };

  return (
    <Routes>
      {/* Public Auth & Registration Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to={getHomeRedirect()} replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterSelectionPage /> : <Navigate to={getHomeRedirect()} replace />}
      />
      <Route
        path="/register/student"
        element={!isAuthenticated ? <StudentRegisterPage /> : <Navigate to={getHomeRedirect()} replace />}
      />
      <Route
        path="/register/warden"
        element={!isAuthenticated ? <WardenRegisterPage /> : <Navigate to={getHomeRedirect()} replace />}
      />
      <Route
        path="/register/electrician"
        element={!isAuthenticated ? <ElectricianRegisterPage /> : <Navigate to={getHomeRedirect()} replace />}
      />
      <Route
        path="/register/plumber"
        element={!isAuthenticated ? <PlumberRegisterPage /> : <Navigate to={getHomeRedirect()} replace />}
      />

      {/* Legacy / Direct Aliases */}
      <Route path="/warden/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Authenticated routes inside AppLayout */}
      <Route element={<AppLayout />}>
        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/complaints" element={<StudentComplaintsPage />} />
          <Route path="/student/complaints/new" element={<SubmitComplaintPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Admin / Warden Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
          <Route path="/admin/technicians" element={<AdminTechniciansPage />} />
          <Route path="/admin/ai-assistant" element={<AdminAiAssistantPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
        </Route>

        {/* Technician Routes */}
        <Route element={<ProtectedRoute allowedRoles={['technician']} />}>
          <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
          <Route path="/technician/tasks" element={<TechnicianTasksPage />} />
          <Route path="/technician/history" element={<TechnicianHistoryPage />} />
        </Route>

        {/* Shared Detail Routes for all roles */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'technician']} />}>
          <Route path="/student/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/admin/complaints/:id" element={<ComplaintDetailsPage />} />
          <Route path="/technician/tasks/:id" element={<ComplaintDetailsPage />} />
        </Route>
      </Route>

      {/* Root & Catch-all redirects */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
      <Route path="*" element={<Navigate to={getHomeRedirect()} replace />} />
    </Routes>
  );
};
