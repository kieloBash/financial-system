import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = this.getGenericMessage(status, exceptionResponse);
        error = exception.constructor.name;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        
        // Handle validation errors (BadRequestException with array of messages)
        if (status === HttpStatus.BAD_REQUEST && Array.isArray(responseObj.message)) {
          const validationMessages = responseObj.message as string[];
          message = validationMessages.length > 0 
            ? validationMessages[0] 
            : 'Invalid request. Please check your input and try again.';
        } else {
          message = this.getGenericMessage(status, responseObj.message);
        }
        
        error = responseObj.error || exception.constructor.name;
      } else {
        message = this.getGenericMessage(status);
        error = exception.constructor.name;
      }
    } else {
      // Handle Prisma errors
      const prismaError = this.handlePrismaError(exception);
      if (prismaError) {
        status = prismaError.status;
        message = prismaError.message;
        error = prismaError.error;
      } else {
        // Handle unknown errors
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'An unexpected error occurred. Please try again later.';
        error = 'InternalServerError';
        
        // Log the actual error for debugging
        this.logger.error(
          `Unexpected error: ${exception instanceof Error ? exception.message : 'Unknown error'}`,
          exception instanceof Error ? exception.stack : undefined,
        );
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      statusCode: status,
      path: request.url,
    };

    // Log error for debugging (but return generic message to client)
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
    );

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(exception: unknown): { status: number; message: string; error: string } | null {
    if (!exception || typeof exception !== 'object') {
      return null;
    }

    const error = exception as any;
    const errorName = error.constructor?.name || '';

    // Check if it's a Prisma error by name
    if (
      errorName.includes('PrismaClient') ||
      errorName.includes('Prisma') ||
      error.code
    ) {
      // Handle Prisma error codes
      if (error.code) {
        switch (error.code) {
          case 'P2002':
            // Unique constraint violation
            return {
              status: HttpStatus.CONFLICT,
              message: 'A resource with this information already exists.',
              error: 'UniqueConstraintViolation',
            };
          
          case 'P2025':
            // Record not found
            return {
              status: HttpStatus.NOT_FOUND,
              message: 'The requested resource was not found.',
              error: 'RecordNotFound',
            };
          
          case 'P2003':
            // Foreign key constraint violation
            return {
              status: HttpStatus.BAD_REQUEST,
              message: 'Invalid reference. The related resource does not exist.',
              error: 'ForeignKeyConstraintViolation',
            };
          
          case 'P2014':
            // Required relation violation
            return {
              status: HttpStatus.BAD_REQUEST,
              message: 'Invalid operation. This resource is required by other resources.',
              error: 'RequiredRelationViolation',
            };
          
          default:
            // Other Prisma errors
            this.logger.error(`Prisma error: ${error.code} - ${error.message}`);
            return {
              status: HttpStatus.BAD_REQUEST,
              message: 'A database error occurred. Please check your input and try again.',
              error: 'DatabaseError',
            };
        }
      }

      // Handle Prisma validation errors
      if (errorName.includes('ValidationError')) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid data provided. Please check your input and try again.',
          error: 'ValidationError',
        };
      }

      // Generic Prisma error
      this.logger.error(`Prisma error: ${errorName} - ${error.message}`);
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'A database error occurred. Please check your input and try again.',
        error: 'DatabaseError',
      };
    }

    return null;
  }

  private getGenericMessage(status: number, originalMessage?: string | string[]): string {
    // If original message is an array, use the first one
    const message = Array.isArray(originalMessage) 
      ? originalMessage[0] 
      : originalMessage;

    // Return generic messages based on status code
    // For security-sensitive errors (401, 403), always use generic messages
    // For validation errors, use the original message if it's helpful
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        // Keep validation error messages as they're helpful to users
        if (message && (message.includes('must be') || message.includes('required') || message.includes('should'))) {
          return message;
        }
        return message || 'Invalid request. Please check your input and try again.';
      
      case HttpStatus.UNAUTHORIZED:
        // Always use generic message for security reasons
        return 'Authentication required. Please log in and try again.';
      
      case HttpStatus.FORBIDDEN:
        // Always use generic message for security reasons
        return 'You do not have permission to access this resource.';
      
      case HttpStatus.NOT_FOUND:
        return message || 'The requested resource was not found.';
      
      case HttpStatus.CONFLICT:
        // For conflicts, provide a generic but slightly more informative message
        return 'A resource with this information already exists.';
      
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return message || 'Unable to process the request. Please check your input.';
      
      case HttpStatus.INTERNAL_SERVER_ERROR:
        // Always use generic message
        return 'An internal server error occurred. Please try again later.';
      
      case HttpStatus.SERVICE_UNAVAILABLE:
        return 'Service is temporarily unavailable. Please try again later.';
      
      default:
        return message || 'An error occurred. Please try again.';
    }
  }
}
