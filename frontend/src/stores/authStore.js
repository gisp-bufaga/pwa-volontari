import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
          // TODO: Implement actual API call in Sprint 1
          // const { user, access, refresh } = await authService.login(credentials);
          
          // Placeholder for now
          console.log('Login with:', credentials);
          
          // Mock successful login
          setTimeout(() => {
            set({
              user: { id: 1, username: 'demo', role: 'admin' },
              accessToken: 'mock-access-token',
              refreshToken: 'mock-refresh-token',
              isAuthenticated: true,
              isLoading: false,
            });
          }, 1000);
        } catch (error) {
          set({ 
            error: error.message || 'Login fallito', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
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
