import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';

/**
 * Wraps routes that require authentication and a specific role.
 *
 * - No user  → redirect /login
 * - Student visiting faculty route → redirect /student/dashboard
 * - Faculty visiting student route → redirect /faculty/dashboard
 * - Correct role → render children
 *
 * @param {{ expectedRole: 'student' | 'faculty', children: React.ReactNode }} props
 */
export default function ProtectedRoute({ expectedRole, children }) {
  const user = useAuthStore((s) => s.user);

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role mismatch — send each role to their own home
  if (user.role !== expectedRole) {
    const home = user.role === 'student' ? '/student/dashboard' : '/faculty/dashboard';
    return <Navigate to={home} replace />;
  }

  return children;
}
