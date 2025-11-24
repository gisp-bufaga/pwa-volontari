import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

/**
 * Authentication Store
 * Manages user authentication state with JWT tokens
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setTokens: (accessToken, refreshToken) => 
        set({ accessToken, refreshToken }),

      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login/', credentials);
          const { user, access, refresh } = response.data;
          
          set({
            user,
            accessToken: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          return { success: true };
        } catch (error) {
          const errorMessage = error.response?.data?.non_field_errors?.[0] 
            || error.response?.data?.detail 
            || 'Login fallito. Verifica le credenziali.';
          
          set({ 
            error: errorMessage, 
            isLoading: false,
            isAuthenticated: false,
          });
          
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        
        try {
          if (refreshToken) {
            await api.post('/auth/logout/', { refresh: refreshToken });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      fetchProfile: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/auth/profile/');
          set({ 
            user: response.data, 
            isAuthenticated: true,
            isLoading: false 
          });
          return { success: true, data: response.data };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.patch('/auth/profile/', data);
          set({ 
            user: response.data, 
            isLoading: false 
          });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      // Helper methods
      hasRole: (role) => {
        const { user } = get();
        return user?.role === role;
      },

      isAdmin: () => {
        const { user } = get();
        return ['admin', 'superadmin'].includes(user?.role);
      },

      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === 'superadmin';
      },

      isBase: () => {
        const { user } = get();
        return user?.role === 'base';
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);