import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore.js';

/**
 * Parses a named cookie value from document.cookie.
 * @param {string} name
 * @returns {string | null}
 */
function getCookie(name) {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/**
 * Initialises a Socket.io connection for the logged-in user,
 * wires real-time events to React Query cache invalidations,
 * and cleans up on unmount.
 */
export function useSocket() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Prefer the real JWT from the httpOnly cookie; fall back to userId
    // so the server-side auth middleware can identify the socket.
    const token = getCookie('token') ?? user.userId;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';

    const socket = io(socketUrl, {
      withCredentials: true,
      auth: { token },
      // Reconnection settings
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    // ── Event handlers ─────────────────────────────────────────────────────

    socket.on('assignment_posted', ({ assignment }) => {
      toast.info(`New assignment: "${assignment?.title ?? 'Untitled'}"`, {
        description: 'A new assignment has been posted for you.',
      });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('submission_received', ({ assignmentId, studentId, notification }) => {
      const msg = notification?.message ?? 'A student submitted an assignment.';
      toast.info('New submission received', { description: msg });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('marks_awarded', ({ marks, maxMarks, assignmentId, notification }) => {
      const msg = notification?.message ?? `Your submission has been graded. Marks: ${marks}/${maxMarks}`;
      toast.success('Assignment graded!', { description: msg });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('deadline_warning', ({ title, deadline, notification }) => {
      const label = title ?? notification?.message ?? 'An assignment is due soon.';
      toast.warning('Deadline approaching', {
        description: `"${label}" is due within 24 hours.`,
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      socket.disconnect();
    };
  }, [user, queryClient]);
}
