import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse, RegisterResponse } from '../types/api';
import { apiClient } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ hasHydrated: state });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
          });

          if (response.success) {
            const { access_token, user } = response.payload;
            apiClient.setToken(access_token);
            set({
              user,
              token: access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<RegisterResponse>('/auth/register', {
            name,
            email,
            password,
          });

          if (response.success) {
            const { access_token, user } = response.payload;
            apiClient.setToken(access_token);
            set({
              user,
              token: access_token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            throw new Error('Registration failed');
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Registration failed';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        apiClient.setToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      initialize: () => {
        const token = apiClient.getToken();
        if (token) {
          apiClient.setToken(token);
          // Token exists but we don't have user data, so we'll need to verify it
          // For now, we'll just set the token and let the app verify it
          set({ token, isAuthenticated: !!token });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Initialize API client with token after hydration
        if (state?.token) {
          apiClient.setToken(state.token);
        }
      },
    },
  ),
);
