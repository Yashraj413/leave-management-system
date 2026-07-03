import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route by auth state and, optionally, role.
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'manager' ? '/manager/dashboard' : '/dashboard'} replace />;
  }

  return children;
}
