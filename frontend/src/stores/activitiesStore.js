import { create } from 'zustand';
import activitiesService from '../services/activitiesService';

const useActivitiesStore = create((set, get) => ({
  // State
  activities: [],
  activitiesByArea: {},
  selectedActivity: null,
  shifts: [],
  selectedShift: null,
  calendarShifts: [],
  loading: false,
  error: null,

  // Actions - Activities
  fetchActivities: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getActivities(params);
      set({ activities: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchActivitiesByArea: async () => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getActivitiesByArea();
      set({ activitiesByArea: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchActivity: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getActivity(id);
      set({ selectedActivity: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createActivity: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.createActivity(data);
      set((state) => ({
        activities: [...state.activities, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateActivity: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.updateActivity(id, data);
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === id ? response.data : a
        ),
        selectedActivity:
          state.selectedActivity?.id === id
            ? response.data
            : state.selectedActivity,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteActivity: async (id) => {
    set({ loading: true, error: null });
    try {
      await activitiesService.deleteActivity(id);
      set((state) => ({
        activities: state.activities.filter((a) => a.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Actions - Shifts
  fetchShifts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getShifts(params);
      set({ shifts: response.data.results || response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchShift: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getShift(id);
      set({ selectedShift: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchCalendarShifts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getShiftsCalendar(params);
      set({ calendarShifts: response.data.turni || [], loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchUpcomingShifts: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.getUpcomingShifts(params);
      set({ shifts: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createShift: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.createShift(data);
      set((state) => ({
        shifts: [...state.shifts, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateShift: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await activitiesService.updateShift(id, data);
      set((state) => ({
        shifts: state.shifts.map((s) => (s.id === id ? response.data : s)),
        selectedShift:
          state.selectedShift?.id === id ? response.data : state.selectedShift,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteShift: async (id) => {
    set({ loading: true, error: null });
    try {
      await activitiesService.deleteShift(id);
      set((state) => ({
        shifts: state.shifts.filter((s) => s.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  clearSelectedActivity: () => set({ selectedActivity: null }),
  clearSelectedShift: () => set({ selectedShift: null }),
}));

export default useActivitiesStore;