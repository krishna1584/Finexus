import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  // Gate only on isAuthenticated + a valid token.
  // userId may be null briefly when the JWT response lacks an `id` field
  // (the email-lookup fallback is async), so we don't block on it here.
  if (!isAuthenticated || !token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <Outlet />;
}
