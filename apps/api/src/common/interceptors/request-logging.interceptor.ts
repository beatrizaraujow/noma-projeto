import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

const SERVICE_NAME = 'api';

type AuthenticatedUser = {
  userId?: string;
  workspaceId?: string;
};

type RequestWithContext = Request & {
  requestId?: string;
  user?: AuthenticatedUser;
};

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<RequestWithContext>();
    const res = httpContext.getResponse<Response>();
    const startAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        this.logger.log(this.serializeLog(req, res, startAt));
      }),
      catchError((error: unknown) => {
        this.logger.error(this.serializeLog(req, res, startAt, error));
        return throwError(() => error);
      })
    );
  }

  private serializeLog(
    req: RequestWithContext,
    res: Response,
    startAt: number,
    error?: unknown
  ): string {
    const durationMs = Date.now() - startAt;
    const requestWorkspaceId = req.params?.workspaceId || req.query?.workspaceId;

    const payload = {
      timestamp: new Date().toISOString(),
      level: error ? 'error' : 'info',
      service: SERVICE_NAME,
      requestId: req.requestId || null,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.userId || null,
      workspaceId: req.user?.workspaceId || requestWorkspaceId || null,
      ip: req.ip,
      userAgent: req.headers['user-agent'] || null,
      error: error ? this.serializeError(error) : undefined,
    };

    return JSON.stringify(payload);
  }

  private serializeError(error: unknown): { message: string; name?: string; stack?: string } {
    if (error instanceof Error) {
      return {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    return {
      message: 'Unknown error',
    };
  }
}
