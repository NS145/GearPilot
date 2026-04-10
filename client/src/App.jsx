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

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/service" />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
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
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/racks" element={<ProtectedRoute adminOnly><AdminRacks /></ProtectedRoute>} />
          <Route path="/admin/trays" element={<ProtectedRoute adminOnly><AdminTrays /></ProtectedRoute>} />
          <Route path="/admin/laptops" element={<ProtectedRoute adminOnly><AdminLaptops /></ProtectedRoute>} />
          <Route path="/admin/assignments" element={<ProtectedRoute adminOnly><AdminAssignments /></ProtectedRoute>} />
          <Route path="/admin/employees" element={<ProtectedRoute adminOnly><AdminEmployees /></ProtectedRoute>} />
          <Route path="/admin/activity" element={<ProtectedRoute adminOnly><AdminActivity /></ProtectedRoute>} />

          {/* Service routes */}
          <Route path="/service" element={<ProtectedRoute><ServiceDashboard /></ProtectedRoute>} />
          <Route path="/service/trays" element={<ProtectedRoute><ServiceTrays /></ProtectedRoute>} />
          <Route path="/service/assign" element={<ProtectedRoute><ServiceAssign /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
