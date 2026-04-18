import { useQueryClient } from '@tanstack/react-query';
import * as notificationApi from '../api/notificationApi.js';
import { useQuery, useMutation } from '@tanstack/react-query';

/**
 * Fetches all notifications for the current user and exposes
 * actions to mark individual or all notifications as read.
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationApi.getNotifications();
      return res.data.notifications;
    },
    // Re-fetch periodically in case socket events are missed
    refetchInterval: 60_000,
  });

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const { mutate: markAsRead } = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return { notifications, unreadCount, isLoading, markAsRead, markAllRead };
}
