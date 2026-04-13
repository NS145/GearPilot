import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/auth/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminRacks from './pages/admin/Racks';
import AdminTrays from './pages/admin/Trays';
import AdminLaptops from './pages/admin/Laptops';
import AdminAssignments from './pages/admin/Assignments';
import AdminEmployees from './pages/admin/Employees';
import AdminActivity from './pages/admin/Activity';
import ServiceDashboard from './pages/service/Dashboard';
import ServiceTrays from './pages/service/Trays';
import ServiceAssign from './pages/service/Assign';

import EmployeeDashboard from './pages/employee/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import Settings from './pages/common/Settings';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) {
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'employee') return <Navigate to="/employee" />;
    return <Navigate to="/service" />;
  }
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'employee') return <Navigate to="/employee" />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/service'} />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/racks" element={<ProtectedRoute roleRequired="admin"><AdminRacks /></ProtectedRoute>} />
          <Route path="/admin/trays" element={<ProtectedRoute roleRequired="admin"><AdminTrays /></ProtectedRoute>} />
          <Route path="/admin/laptops" element={<ProtectedRoute roleRequired="admin"><AdminLaptops /></ProtectedRoute>} />
          <Route path="/admin/assignments" element={<ProtectedRoute roleRequired="admin"><AdminAssignments /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute roleRequired="admin"><AdminEmployees /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute roleRequired="admin"><AdminActivity /></ProtectedRoute>} />
          <Route path="/admin/tickets" element={<ProtectedRoute roleRequired="admin"><AdminTickets /></ProtectedRoute>} />

          {/* Service routes */}
          <Route path="/service" element={<ProtectedRoute roleRequired="service"><ServiceDashboard /></ProtectedRoute>} />
          <Route path="/service/trays" element={<ProtectedRoute roleRequired="service"><ServiceTrays /></ProtectedRoute>} />
          <Route path="/service/assign" element={<ProtectedRoute roleRequired="service"><ServiceAssign /></ProtectedRoute>} />

          {/* Employee routes */}
          <Route path="/employee" element={<ProtectedRoute roleRequired="employee"><EmployeeDashboard /></ProtectedRoute>} />

          {/* Common routes */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
