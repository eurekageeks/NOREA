import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/ui/StateViews';

export function RequireStudent() {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function RequireAdmin({ permission }) {
  const { user, loading, isAdmin, can } = useAuth();
  const location = useLocation();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (!isAdmin) return <Navigate to="/portal" replace />;
  if (permission && !can(permission)) return <Navigate to="/admin" replace />;
  return <Outlet />;
}

export function GuestOnly({ portal = 'student' }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <PageLoader />;
  if (user) {
    if (portal === 'admin' && isAdmin) return <Navigate to="/admin" replace />;
    if (portal === 'student' && !isAdmin) return <Navigate to="/portal" replace />;
  }
  return <Outlet />;
}
