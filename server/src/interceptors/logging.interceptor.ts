import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, query, params } = request;
        const userAgent = request.get('user-agent') || '';
        const ip = request.ip || request.connection.remoteAddress;
        const startTime = Date.now();

        // Log request
        this.logger.log(
            `→ ${method} ${url} - IP: ${ip} - ${userAgent}`,
        );

        // Optionally log body/query/params (be careful with sensitive data)
        if (Object.keys(query).length > 0) {
            this.logger.debug(`  Query: ${JSON.stringify(query)}`);
        }
        if (Object.keys(params).length > 0) {
            this.logger.debug(`  Params: ${JSON.stringify(params)}`);
        }
        if (body && Object.keys(body).length > 0 && method !== 'GET') {
            // Don't log password fields
            const sanitizedBody = { ...body };
            if (sanitizedBody.password) {
                sanitizedBody.password = '***';
            }
            this.logger.debug(`  Body: ${JSON.stringify(sanitizedBody)}`);
        }

        return next.handle().pipe(
            tap({
                next: (data) => {
                    const response = context.switchToHttp().getResponse();
                    const { statusCode } = response;
                    const duration = Date.now() - startTime;

                    this.logger.log(
                        `← ${method} ${url} ${statusCode} - ${duration}ms`,
                    );
                },
                error: (error) => {
                    const duration = Date.now() - startTime;
                    this.logger.error(
                        `✗ ${method} ${url} - ${duration}ms - ${error.message}`,
                    );
                },
            }),
        );
    }
}
