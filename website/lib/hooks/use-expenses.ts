import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type {
  Expense,
  ExpensesResponse,
  ApiSuccessResponse,
} from '../types/api';

interface QueryExpensesParams {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

interface CreateExpenseData {
  categoryId: string;
  amount: string;
  description?: string;
  date?: string;
}

interface UpdateExpenseData {
  categoryId?: string;
  amount?: string;
  description?: string;
  date?: string;
}

export function useExpenses(params?: QueryExpensesParams) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.minAmount !== undefined) queryParams.append('minAmount', params.minAmount.toString());
      if (params?.maxAmount !== undefined) queryParams.append('maxAmount', params.maxAmount.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await apiClient.get<ExpensesResponse>(
        `/expenses?${queryParams.toString()}`,
      );

      if (response.success) {
        return response.payload;
      }
      throw new Error('Failed to fetch expenses');
    },
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: ['expense', id],
    queryFn: async () => {
      const response = await apiClient.get<Expense>(`/expenses/${id}`);

      if (response.success) {
        return response.payload;
      }
      throw new Error('Failed to fetch expense');
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExpenseData) => {
      const response = await apiClient.post<Expense>('/expenses', data);

      if (response.success) {
        return response.payload;
      }
      throw new Error('Failed to create expense');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExpenseData }) => {
      const response = await apiClient.patch<Expense>(`/expenses/${id}`, data);

      if (response.success) {
        return response.payload;
      }
      throw new Error('Failed to update expense');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense', variables.id] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/expenses/${id}`);

      if (response.success) {
        return;
      }
      throw new Error('Failed to delete expense');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
