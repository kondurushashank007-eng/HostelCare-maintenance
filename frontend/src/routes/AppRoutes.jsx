import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

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
        Initializing HostelCare...
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
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getHomeRedirect()} />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={getHomeRedirect()} />} />

      {/* Authenticated routes inside AppLayout */}
      <Route element={<AppLayout />}>
        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/complaints" element={<StudentComplaintsPage />} />
          <Route path="/student/complaints/new" element={<SubmitComplaintPage />} />
          <Route path="/student/profile" element={<StudentProfilePage />} />
        </Route>

        {/* Admin Routes */}
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

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />
      <Route path="*" element={<Navigate to={getHomeRedirect()} replace />} />
    </Routes>
  );
};

