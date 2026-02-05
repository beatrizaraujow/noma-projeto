import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { getErrorMessage } from './types';
import * as crypto from 'crypto';

interface WebhookConfig {
  events: string[]; // Events to trigger on: ['task.created', 'task.updated', 'comment.added', etc.]
  provider: 'zapier' | 'make' | 'custom';
  secret?: string; // HMAC secret for signature verification
}

interface CreateEndpointParams {
  workspaceId: string;
  name: string;
  description?: string;
  provider: 'zapier' | 'make' | 'custom';
  events: string[];
  createdBy: string;
  secret?: string;
}

interface TriggerWebhookParams {
  workspaceId: string;
  event: string;
  payload: any;
}

@Injectable()
export class WebhookService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new webhook endpoint
   */
  async createEndpoint(params: CreateEndpointParams) {
    const { workspaceId, name, description, provider, events, createdBy, secret } = params;

    try {
      // Generate unique URL
      const uniqueId = crypto.randomBytes(16).toString('hex');
      const url = `/api/webhooks/${workspaceId}/${uniqueId}`;

      // Generate secret if not provided
      const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

      const endpoint = await (this.prisma as any).webhookEndpoint.create({
        data: {
          workspaceId,
          name,
          description,
          provider,
          url,
          secret: webhookSecret,
          events,
          createdBy,
        },
      });

      return {
        success: true,
        endpoint,
        message: 'Webhook endpoint created successfully',
      };
    } catch (error) {
      throw new Error(`Failed to create webhook endpoint: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get all webhook endpoints for a workspace
   */
  async getEndpoints(workspaceId: string) {
    try {
      return await (this.prisma as any).webhookEndpoint.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to fetch endpoints: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get webhook endpoint by URL
   */
  async getEndpointByUrl(url: string) {
    try {
      return await (this.prisma as any).webhookEndpoint.findUnique({
        where: { url },
      });
    } catch (error) {
      throw new Error(`Failed to fetch endpoint: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Update webhook endpoint
   */
  async updateEndpoint(
    endpointId: string,
    updates: {
      name?: string;
      description?: string;
      active?: boolean;
      events?: string[];
    },
  ) {
    try {
      const endpoint = await (this.prisma as any).webhookEndpoint.update({
        where: { id: endpointId },
        data: updates,
      });

      return {
        success: true,
        endpoint,
        message: 'Webhook endpoint updated successfully',
      };
    } catch (error) {
      throw new Error(`Failed to update endpoint: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Delete webhook endpoint
   */
  async deleteEndpoint(endpointId: string) {
    try {
      await (this.prisma as any).webhookEndpoint.delete({
        where: { id: endpointId },
      });

      return {
        success: true,
        message: 'Webhook endpoint deleted successfully',
      };
    } catch (error) {
      throw new Error(`Failed to delete endpoint: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Trigger webhooks for a specific event
   */
  async triggerWebhooks(params: TriggerWebhookParams) {
    const { workspaceId, event, payload } = params;

    try {
      // Find all active endpoints that listen to this event
      const endpoints = await (this.prisma as any).webhookEndpoint.findMany({
        where: {
          workspaceId,
          active: true,
        },
      });

      const matchingEndpoints = endpoints.filter((endpoint: any) => {
        const events = Array.isArray(endpoint.events) ? endpoint.events : [];
        return events.includes(event) || events.includes('*');
      });

      if (matchingEndpoints.length === 0) {
        return {
          success: true,
          triggered: 0,
          message: 'No active endpoints for this event',
        };
      }

      // Trigger all matching endpoints in parallel
      const results = await Promise.allSettled(
        matchingEndpoints.map((endpoint: any) =>
          this.sendWebhook(endpoint.id, endpoint.url, event, payload, endpoint.secret),
        ),
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      return {
        success: true,
        triggered: succeeded,
        failed,
        message: `Triggered ${succeeded} webhook(s), ${failed} failed`,
      };
    } catch (error) {
      throw new Error(`Failed to trigger webhooks: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Send webhook to external URL
   */
  private async sendWebhook(
    endpointId: string,
    url: string,
    event: string,
    payload: any,
    secret?: string,
  ) {
    const startTime = Date.now();

    try {
      // Build webhook payload
      const webhookPayload = {
        event,
        timestamp: new Date().toISOString(),
        data: payload,
      };

      const body = JSON.stringify(webhookPayload);

      // Generate signature if secret is provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Webhook-Event': event,
        'X-Webhook-Timestamp': webhookPayload.timestamp,
      };

      if (secret) {
        const signature = this.generateSignature(body, secret);
        headers['X-Webhook-Signature'] = signature;
      }

      // Send webhook
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
      });

      const responseData = response.ok ? await response.text() : null;

      // Log the webhook call
      await (this.prisma as any).webhookCall.create({
        data: {
          endpointId,
          event,
          payload: webhookPayload,
          response: responseData ? { body: responseData } : null,
          status: response.ok ? 'success' : 'error',
          statusCode: response.status,
          error: response.ok ? null : `HTTP ${response.status}: ${response.statusText}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status ${response.status}`);
      }

      return {
        success: true,
        statusCode: response.status,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      // Log failed webhook call
      await (this.prisma as any).webhookCall.create({
        data: {
          endpointId,
          event,
          payload: { event, data: payload },
          status: 'error',
          error: getErrorMessage(error),
        },
      });

      throw error;
    }
  }

  /**
   * Retry failed webhook
   */
  async retryWebhook(callId: string) {
    try {
      const call = await (this.prisma as any).webhookCall.findUnique({
        where: { id: callId },
        include: { endpoint: true },
      });

      if (!call) {
        throw new Error('Webhook call not found');
      }

      if (call.status === 'success') {
        throw new Error('Cannot retry successful webhook');
      }

      if (call.retries >= 3) {
        throw new Error('Maximum retry attempts reached');
      }

      // Retry the webhook
      await this.sendWebhook(
        call.endpointId,
        call.endpoint.url,
        call.event,
        call.payload.data,
        call.endpoint.secret,
      );

      // Update retry count
      await (this.prisma as any).webhookCall.update({
        where: { id: callId },
        data: { retries: call.retries + 1 },
      });

      return {
        success: true,
        message: 'Webhook retried successfully',
      };
    } catch (error) {
      throw new Error(`Failed to retry webhook: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get webhook call logs
   */
  async getCallLogs(
    endpointId: string,
    options?: { limit?: number; status?: string },
  ) {
    try {
      const where: any = { endpointId };
      if (options?.status) where.status = options.status;

      return await (this.prisma as any).webhookCall.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: options?.limit || 50,
      });
    } catch (error) {
      throw new Error(`Failed to fetch logs: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Generate HMAC signature for webhook verification
   */
  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = this.generateSignature(payload, secret);
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature),
      );
    } catch (error) {
      return false;
    }
  }

  /**
   * Handle incoming webhook from external service (Zapier/Make.com)
   */
  async handleIncomingWebhook(url: string, payload: any, signature?: string) {
    try {
      const endpoint = await this.getEndpointByUrl(url);

      if (!endpoint) {
        throw new Error('Webhook endpoint not found');
      }

      if (!endpoint.active) {
        throw new Error('Webhook endpoint is inactive');
      }

      // Verify signature if secret is configured
      if (endpoint.secret && signature) {
        const isValid = this.verifySignature(
          JSON.stringify(payload),
          signature,
          endpoint.secret,
        );

        if (!isValid) {
          throw new Error('Invalid webhook signature');
        }
      }

      // Process the incoming webhook payload
      // This could create tasks, trigger automations, etc.
      // For now, just log it

      await (this.prisma as any).webhookCall.create({
        data: {
          endpointId: endpoint.id,
          event: 'incoming_webhook',
          payload,
          status: 'success',
          statusCode: 200,
        },
      });

      return {
        success: true,
        message: 'Incoming webhook processed successfully',
      };
    } catch (error) {
      throw new Error(`Failed to handle incoming webhook: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Get webhook statistics
   */
  async getStats(workspaceId: string) {
    try {
      const endpoints = await (this.prisma as any).webhookEndpoint.findMany({
        where: { workspaceId },
        include: {
          calls: {
            orderBy: { createdAt: 'desc' },
            take: 100,
          },
        },
      });

      const stats = {
        totalEndpoints: endpoints.length,
        activeEndpoints: endpoints.filter((e: any) => e.active).length,
        totalCalls: endpoints.reduce((sum: number, e: any) => sum + e.calls.length, 0),
        successfulCalls: endpoints.reduce(
          (sum: number, e: any) =>
            sum + e.calls.filter((c: any) => c.status === 'success').length,
          0,
        ),
        failedCalls: endpoints.reduce(
          (sum: number, e: any) =>
            sum + e.calls.filter((c: any) => c.status === 'error').length,
          0,
        ),
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get stats: ${getErrorMessage(error)}`);
    }
  }
}
