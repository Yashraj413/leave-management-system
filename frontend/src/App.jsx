import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import LeaveDetails from './pages/LeaveDetails';
import PendingApprovals from './pages/PendingApprovals';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      {/* Employee routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply-leave"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <ApplyLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/apply-leave/:id"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <ApplyLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leave-history"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <LeaveHistory />
          </ProtectedRoute>
        }
      />

      {/* Manager routes */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <ManagerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/pending-approvals"
        element={
          <ProtectedRoute allowedRoles={['manager']}>
            <PendingApprovals />
          </ProtectedRoute>
        }
      />

      {/* Shared routes */}
      <Route
        path="/leave-details/:id"
        element={
          <ProtectedRoute>
            <LeaveDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
