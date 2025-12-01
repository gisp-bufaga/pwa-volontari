import api from './api';

const activitiesService = {
  // Activities
  getActivities: (params = {}) => {
    return api.get('/activities/', { params });
  },

  getActivity: (id) => {
    return api.get(`/activities/${id}/`);
  },

  getActivitiesByArea: () => {
    return api.get('/activities/by_area/');
  },

  createActivity: (data) => {
    return api.post('/activities/', data);
  },

  updateActivity: (id, data) => {
    return api.patch(`/activities/${id}/`, data);
  },

  deleteActivity: (id) => {
    return api.delete(`/activities/${id}/`);
  },

  getActivityShifts: (activityId) => {
    return api.get(`/activities/${activityId}/prossimi_turni/`);
  },

  // Shifts
  getShifts: (params = {}) => {
    return api.get('/activities/shifts/', { params });
  },

  getShift: (id) => {
    return api.get(`/activities/shifts/${id}/`);
  },

  getShiftsCalendar: (params = {}) => {
    return api.get('/activities/shifts/calendario/', { params });
  },

  getUpcomingShifts: (params = {}) => {
    return api.get('/activities/shifts/prossimi/', { params });
  },

  getTodayShifts: () => {
    return api.get('/activities/shifts/oggi/');
  },

  createShift: (data) => {
    return api.post('/activities/shifts/', data);
  },

  updateShift: (id, data) => {
    return api.patch(`/activities/shifts/${id}/`, data);
  },

  deleteShift: (id) => {
    return api.delete(`/activities/shifts/${id}/`);
  },
};

export default activitiesService;