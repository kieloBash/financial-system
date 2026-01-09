import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Category } from '../types/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>('/categories');

      if (response.success) {
        return response.payload;
      }
      throw new Error('Failed to fetch categories');
    },
  });
}
