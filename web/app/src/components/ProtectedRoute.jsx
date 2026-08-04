import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Avoid redirecting to /login before the initial async session check
  // resolves — without this, refreshing /cuenta while genuinely logged in
  // would briefly bounce you out on every reload.
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }
  return children;
}
