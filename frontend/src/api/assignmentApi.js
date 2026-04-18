import axiosInstance from './axiosInstance.js';

/**
 * GET /api/assignments
 */
export const getAssignments = () =>
  axiosInstance.get('/api/assignments');

/**
 * POST /api/assignments
 * @param {Object} data - { title, description, deadline, maxMarks, assignedTo[] }
 */
export const createAssignment = (data) =>
  axiosInstance.post('/api/assignments', data);

/**
 * POST /api/assignments/:id/submit
 * @param {string} id - Assignment ID
 * @param {FormData} formData - Must contain a field named "file"
 */
export const submitAssignment = (id, formData) =>
  axiosInstance.post(`/api/assignments/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

/**
 * PATCH /api/assignments/:id/grade
 * @param {string} id - Assignment ID
 * @param {{ studentId, marks, feedback }} data
 */
export const gradeSubmission = (id, data) =>
  axiosInstance.patch(`/api/assignments/${id}/grade`, data);

/**
 * GET /api/assignments/:id/submissions
 */
export const getSubmissions = (id) =>
  axiosInstance.get(`/api/assignments/${id}/submissions`);

/**
 * GET /api/assignments/users?role=student|faculty
 * @param {string} [role]
 */
export const getUsers = (role) =>
  axiosInstance.get('/api/assignments/users', { params: role ? { role } : {} });
