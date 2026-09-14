import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function ProtectedRoute({ children, requireStaff = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Avoid redirecting to /login before the initial async session check resolves
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  if (requireStaff && !user.isStaff) {
    return <Navigate to="/cuenta" replace />;
  }

  return children;
}
