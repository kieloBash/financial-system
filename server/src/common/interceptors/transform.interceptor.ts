import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If the response already has the success format, return it as-is
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Determine message based on HTTP method and status code
        const method = request.method;
        const statusCode = response.statusCode;
        let message = 'Operation completed successfully';

        if (method === 'GET') {
          message = 'Data retrieved successfully';
        } else if (method === 'POST') {
          message = statusCode === 201 ? 'Resource created successfully' : 'Resource saved successfully';
        } else if (method === 'PATCH' || method === 'PUT') {
          message = 'Resource updated successfully';
        } else if (method === 'DELETE') {
          message = 'Resource deleted successfully';
        }

        return {
          success: true,
          message,
          payload: data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
