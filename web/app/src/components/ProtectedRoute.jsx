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

  // Ingenieros y Auditores no tienen acceso al portal de clientes (solo Admin y Clientes)
  if (!requireStaff && user.isStaff && !user.isAdmin) {
    return <Navigate to="/equipo" replace />;
  }

  return children;
}
