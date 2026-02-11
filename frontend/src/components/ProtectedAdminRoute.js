import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminTokenValid, clearAdminToken } from '../utils/auth';

/**
 * If token is missing or expired, redirect to /admin-login.
 * Otherwise render children.
 */
export function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const valid = isAdminTokenValid();
  if (!valid) {
    clearAdminToken();
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }
  return children;
}
