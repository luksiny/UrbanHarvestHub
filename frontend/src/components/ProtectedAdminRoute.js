import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * If admin is missing, redirect to /admin-login.
 * Otherwise render children.
 */
export function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const { admin, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!admin) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }
  return children;
}
