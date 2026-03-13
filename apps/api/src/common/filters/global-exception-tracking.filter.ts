import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import type { Request } from 'express';
import { sendErrorWebhook } from '../monitoring/error-webhook';

type RequestWithContext = Request & {
  requestId?: string;
  user?: {
    userId?: string;
    workspaceId?: string;
  };
};

@Catch()
export class GlobalExceptionTrackingFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionTrackingFilter.name);

  constructor(private readonly adapterHost: HttpAdapterHost) {
    super(adapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<RequestWithContext>();

    const statusCode = exception instanceof HttpException ? exception.getStatus() : 500;
    const error = exception instanceof Error ? exception : new Error('Unknown exception');

    const payload = {
      source: 'backend' as const,
      message: error.message,
      route: req?.originalUrl,
      method: req?.method,
      statusCode,
      requestId: req?.requestId || null,
      userId: req?.user?.userId || null,
      workspaceId: req?.user?.workspaceId || (req?.params?.workspaceId as string | undefined) || (req?.query?.workspaceId as string | undefined) || null,
      release: process.env.APP_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || null,
      timestamp: new Date().toISOString(),
      stack: error.stack || null,
    };

    this.logger.error(JSON.stringify(payload));

    sendErrorWebhook(payload).catch((webhookError) => {
      this.logger.warn(`Failed to send error webhook: ${String(webhookError)}`);
    });

    super.catch(exception, host);
  }
}
