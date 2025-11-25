import api from './api';

/**
 * User Management Service
 * Handles all user-related API calls including bulk operations, import/export
 */

// Basic CRUD operations
export const getUsers = async (params = {}) => {
  const response = await api.get('/auth/users/', { params });
  return response.data;
};

export const getUser = async (id) => {
  const response = await api.get(`/auth/users/${id}/`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await api.post('/auth/users/', userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.patch(`/auth/users/${id}/`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/auth/users/${id}/`);
  return response.data;
};

// Bulk operations
export const bulkActions = async (action, userIds, extraData = {}) => {
  const response = await api.post('/auth/bulk-actions/', {
    user_ids: userIds,
    action,
    ...extraData,
  });
  return response.data;
};

// Export users
export const exportUsers = async (filters = {}) => {
  const response = await api.get('/auth/export/', {
    params: filters,
    responseType: 'blob', // Important for file download
  });
  return response.data;
};

// CSV Import - Preview
export const previewCSVImport = async (file, sendCredentials = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('send_credentials', sendCredentials);

  const response = await api.post('/auth/import/preview/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// CSV Import - Confirm
export const confirmCSVImport = async (file, sendCredentials = false) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('send_credentials', sendCredentials);

  const response = await api.post('/auth/import/confirm/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Work Areas
export const getWorkAreas = async () => {
  const response = await api.get('/auth/work-areas/');
  return response.data;
};

export default {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  bulkActions,
  exportUsers,
  previewCSVImport,
  confirmCSVImport,
  getWorkAreas,
};