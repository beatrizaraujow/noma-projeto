import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { sendErrorWebhook } from '../../common/monitoring/error-webhook';

type FrontendErrorBody = {
  message?: string;
  stack?: string;
  route?: string;
  userId?: string;
  workspaceId?: string;
  release?: string;
  metadata?: Record<string, unknown>;
};

@Controller('monitoring')
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);

  @Post('frontend-error')
  async captureFrontendError(@Body() body: FrontendErrorBody, @Req() req: Request) {
    const payload = {
      source: 'frontend' as const,
      message: body.message || 'Unknown frontend error',
      route: body.route || req.headers.referer || 'unknown',
      method: 'browser',
      statusCode: 0,
      requestId: (req.headers['x-request-id'] as string | undefined) || null,
      userId: body.userId || null,
      workspaceId: body.workspaceId || null,
      release: body.release || null,
      timestamp: new Date().toISOString(),
      stack: body.stack || null,
      metadata: body.metadata || {},
      userAgent: req.headers['user-agent'] || null,
      ip: req.ip,
    };

    this.logger.error(JSON.stringify(payload));

    await sendErrorWebhook(payload);

    return {
      accepted: true,
    };
  }
}
