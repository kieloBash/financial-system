'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiClient } from '@/lib/api/client';

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    // Once hydrated, ensure API client has the token
    if (hasHydrated && token) {
      apiClient.setToken(token);
    }
  }, [hasHydrated, token]);

  return <>{children}</>;
}
