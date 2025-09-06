import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore();
  
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}