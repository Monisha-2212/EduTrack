import axiosInstance from './axiosInstance.js';

/**
 * GET /api/notifications
 * @param {{ unreadOnly?: boolean }} [params]
 */
export const getNotifications = (params = {}) =>
  axiosInstance.get('/api/notifications', { params });

/**
 * PATCH /api/notifications/:id/read
 */
export const markAsRead = (id) =>
  axiosInstance.patch(`/api/notifications/${id}/read`);

/**
 * PATCH /api/notifications/read-all
 */
export const markAllRead = () =>
  axiosInstance.patch('/api/notifications/read-all');
