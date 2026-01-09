import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type {
  QuickPrice
} from '../types/api';

export function useQuickPrices() {
  return useQuery({
    queryKey: ['quick-prices'],
    queryFn: async () => {
      const response = await apiClient.get<QuickPrice[]>(
        `/quick-prices`,
      );

      if (response.success) {
        return response.payload;
      }
      throw new Error('Failed to fetch quick prices');
    },
  });
}