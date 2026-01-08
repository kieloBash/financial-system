import { Injectable, ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Call parent canActivate which will trigger JWT validation
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Log error if token validation fails
    if (err) {
      this.logger.error(`JWT validation error: ${err.message}`);
      throw err;
    }
    
    if (!user) {
      this.logger.warn(`JWT validation failed: ${info?.message || 'No user found'}`);
      throw new UnauthorizedException(info?.message || 'Unauthorized');
    }
    
    return user;
  }
}
