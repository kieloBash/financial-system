// API Response Types
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  payload: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  statusCode: number;
  path?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string | null;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterResponse {
  access_token: string;
  user: User;
}

// Category Types
export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string | null;
  icon: string | null;
  createdAt: string;
  updatedAt: string;
}

// Expense Types
export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: string;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
}

export interface ExpensesResponse {
  data: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// QuickPrice Types
export interface QuickPrice {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  amount: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    color: string | null;
    icon: string | null;
  };
}

// Analytics Types
export interface AnalyticsSummary {
  total: number;
  count: number;
  average: number;
  min: number;
  max: number;
  byCategory: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
    } | null;
    total: number;
    count: number;
  }>;
}

export interface TrendsData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  data: Array<{
    date: string;
    total: number;
    count: number;
  }>;
}

export interface CategoryBreakdown {
  total: number;
  breakdown: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
      color: string | null;
      icon: string | null;
    } | null;
    total: number;
    count: number;
    average: number;
    percentage: number;
  }>;
}

export interface TimePeriodAnalysis {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  data: Array<{
    date: string;
    total: number;
    count: number;
    byCategory: Array<{
      categoryId: string;
      total: number;
    }>;
  }>;
}
