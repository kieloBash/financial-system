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
