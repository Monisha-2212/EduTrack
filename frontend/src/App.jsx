import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getMe } from './api/authApi.js';
import useAuthStore from './store/authStore.js';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import FacultyDashboard from './pages/FacultyDashboard.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  const setUser = useAuthStore((s) => s.setUser);

  // Re-hydrate auth state from httpOnly cookie on every page load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await getMe();
        setUser(res.data.user);
      } catch (err) {
        // Not logged in — silently ignore
      }
    };
    initAuth();
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Sonner toast notifications */}
        <Toaster position="bottom-right" richColors closeButton />

        <Routes>
          {/* Public root → redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected student dashboard */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute expectedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected faculty dashboard */}
          <Route
            path="/faculty/dashboard"
            element={
              <ProtectedRoute expectedRole="faculty">
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
