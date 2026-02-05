import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SlackService } from './services/slack.service';
import { DiscordService } from './services/discord.service';
import { EmailService } from './services/email.service';
import { CalendarService } from './services/calendar.service';
import { GitHubService } from './services/github.service';
import { FigmaService } from './services/figma.service';
import { CloudStorageService } from './services/cloud-storage.service';
import { WebhookService } from './services/webhook.service';
import { CreateIntegrationDto, UpdateIntegrationDto, TestIntegrationDto } from './dto';
import { getErrorMessage } from './services/types';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly slackService: SlackService,
    private readonly discordService: DiscordService,
    private readonly emailService: EmailService,
    private readonly calendarService: CalendarService,
    private readonly githubService: GitHubService,
    private readonly figmaService: FigmaService,
    private readonly cloudStorageService: CloudStorageService,
    private readonly webhookService: WebhookService,
  ) {}

  async create(data: CreateIntegrationDto & { createdBy: string }) {
    // Validate configuration based on type
    this.validateConfig(data.type, data.config);

    const integration = await (this.prisma as any).integration.create({
      data: {
        workspaceId: data.workspaceId,
        type: data.type,
        name: data.name,
        description: data.description,
        active: data.active ?? true,
        config: data.config,
        createdBy: data.createdBy,
      },
    });

    // Log creation
    await this.createLog(integration.id, 'integration_created', 'success', 'Integration created successfully');

    return integration;
  }

  async findAll(workspaceId: string) {
    return (this.prisma as any).integration.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const integration = await (this.prisma as any).integration.findUnique({
      where: { id },
      include: {
        logs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!integration) {
      throw new NotFoundException('Integration not found');
    }

    return integration;
  }

  async update(id: string, data: UpdateIntegrationDto) {
    // Validate configuration if provided
    if (data.config) {
      const integration = await this.findOne(id);
      this.validateConfig(integration.type, data.config);
    }

    const updated = await (this.prisma as any).integration.update({
      where: { id },
      data,
    });

    await this.createLog(id, 'integration_updated', 'success', 'Integration updated successfully');

    return updated;
  }

  async remove(id: string) {
    await (this.prisma as any).integration.delete({
      where: { id },
    });

    return { success: true, message: 'Integration deleted successfully' };
  }

  async test(id: string, testData: TestIntegrationDto) {
    const integration = await this.findOne(id);

    try {
      let result;

      switch (integration.type) {
        case 'slack':
          result = await this.slackService.sendMessage(
            integration.config,
            testData.message || 'Test message from NOMA',
            testData.channel,
          );
          break;

        case 'discord':
          result = await this.discordService.sendMessage(
            integration.config,
            testData.message || 'Test message from NOMA',
            testData.channel,
          );
          break;

        case 'email':
          result = await this.emailService.testConnection(integration.config);
          break;

        case 'google_calendar':
        case 'outlook_calendar':
          result = await this.calendarService.testConnection(integration.config, integration.type);
          break;

        default:
          throw new BadRequestException('Unsupported integration type');
      }

      await this.createLog(id, 'integration_tested', 'success', 'Test successful');

      return { success: true, result };
    } catch (error) {
      await this.createLog(id, 'integration_tested', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async getLogs(integrationId: string, options: { limit?: number; status?: string }) {
    return (this.prisma as any).integrationLog.findMany({
      where: {
        integrationId,
        ...(options.status && { status: options.status }),
      },
      orderBy: { createdAt: 'desc' },
      take: options.limit || 50,
    });
  }

  async sendSlackNotification(integrationId: string, message: string, channel?: string) {
    const integration = await this.findOne(integrationId);

    if (integration.type !== 'slack') {
      throw new BadRequestException('Integration is not a Slack integration');
    }

    if (!integration.active) {
      throw new BadRequestException('Integration is not active');
    }

    try {
      const result = await this.slackService.sendMessage(integration.config, message, channel);
      await this.createLog(integrationId, 'notification_sent', 'success', 'Slack notification sent');
      return { success: true, result };
    } catch (error) {
      await this.createLog(integrationId, 'notification_sent', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async sendDiscordNotification(integrationId: string, message: string, channel?: string) {
    const integration = await this.findOne(integrationId);

    if (integration.type !== 'discord') {
      throw new BadRequestException('Integration is not a Discord integration');
    }

    if (!integration.active) {
      throw new BadRequestException('Integration is not active');
    }

    try {
      const result = await this.discordService.sendMessage(integration.config, message, channel);
      await this.createLog(integrationId, 'notification_sent', 'success', 'Discord notification sent');
      return { success: true, result };
    } catch (error) {
      await this.createLog(integrationId, 'notification_sent', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async syncEmail(integrationId: string) {
    const integration = await this.findOne(integrationId);

    if (integration.type !== 'email') {
      throw new BadRequestException('Integration is not an email integration');
    }

    if (!integration.active) {
      throw new BadRequestException('Integration is not active');
    }

    try {
      const result = await this.emailService.syncInbox(integration.config, integration.workspaceId);
      await this.createLog(integrationId, 'email_synced', 'success', `Synced ${result.count} emails`);
      return { success: true, result };
    } catch (error) {
      await this.createLog(integrationId, 'email_synced', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async syncCalendar(integrationId: string) {
    const integration = await this.findOne(integrationId);

    if (!['google_calendar', 'outlook_calendar'].includes(integration.type)) {
      throw new BadRequestException('Integration is not a calendar integration');
    }

    if (!integration.active) {
      throw new BadRequestException('Integration is not active');
    }

    try {
      const result = await this.calendarService.syncEvents(
        integration.config,
        integration.type,
        integration.workspaceId,
      );
      await this.createLog(integrationId, 'calendar_synced', 'success', `Synced ${result.count} events`);
      return { success: true, result };
    } catch (error) {
      await this.createLog(integrationId, 'calendar_synced', 'error', getErrorMessage(error));
      throw error;
    }
  }

  private validateConfig(type: string, config: any) {
    switch (type) {
      case 'slack':
        if (!config.webhookUrl && !config.token) {
          throw new BadRequestException('Slack integration requires webhookUrl or token');
        }
        break;

      case 'discord':
        if (!config.webhookUrl) {
          throw new BadRequestException('Discord integration requires webhookUrl');
        }
        break;

      case 'email':
        if (!config.host || !config.port || !config.user || !config.password) {
          throw new BadRequestException('Email integration requires host, port, user, and password');
        }
        break;

      case 'google_calendar':
        if (!config.clientId || !config.clientSecret || !config.refreshToken) {
          throw new BadRequestException('Google Calendar integration requires OAuth credentials');
        }
        break;

      case 'outlook_calendar':
        if (!config.clientId || !config.clientSecret || !config.refreshToken) {
          throw new BadRequestException('Outlook Calendar integration requires OAuth credentials');
        }
        break;

      case 'github':
        if (!config.token) {
          throw new BadRequestException('GitHub integration requires token');
        }
        break;

      case 'figma':
        if (!config.accessToken) {
          throw new BadRequestException('Figma integration requires accessToken');
        }
        break;

      case 'google_drive':
      case 'dropbox':
        if (!config.accessToken) {
          throw new BadRequestException('Cloud storage integration requires accessToken');
        }
        break;

      case 'zapier':
      case 'make':
      case 'custom_webhook':
        if (!config.events || !Array.isArray(config.events)) {
          throw new BadRequestException('Webhook integration requires events array');
        }
        break;

      default:
        throw new BadRequestException('Unsupported integration type');
    }
  }

  // ==================== GITHUB METHODS ====================

  async linkPRToTask(integrationId: string, taskId: string, repository: string, prNumber: number) {
    const integration = await this.findOne(integrationId);
    
    if (integration.type !== 'github') {
      throw new BadRequestException('Integration must be of type github');
    }

    try {
      const result = await this.githubService.linkPRToTask(
        { workspaceId: integration.workspaceId, taskId, repository, prNumber },
        integration.config,
      );

      await this.createLog(integrationId, 'pr_linked', 'success', result.message);
      return result;
    } catch (error) {
      await this.createLog(integrationId, 'pr_linked', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async syncGitHubRepository(integrationId: string, repository: string) {
    const integration = await this.findOne(integrationId);

    if (integration.type !== 'github') {
      throw new BadRequestException('Integration must be of type github');
    }

    try {
      const result = await this.githubService.syncRepository(
        integration.workspaceId,
        repository,
        integration.config,
      );

      await this.createLog(integrationId, 'repository_synced', 'success', result.message);
      return result;
    } catch (error) {
      await this.createLog(integrationId, 'repository_synced', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async getPRsForTask(taskId: string) {
    return this.githubService.getPRsForTask(taskId);
  }

  async handleGitHubWebhook(event: string, payload: any, workspaceId: string) {
    return this.githubService.handleWebhook(event, payload, workspaceId);
  }

  // ==================== FIGMA METHODS ====================

  async attachFigmaFile(
    integrationId: string,
    fileKey: string,
    projectId?: string,
    taskId?: string,
    createdBy?: string,
  ) {
    const integration = await this.findOne(integrationId);

    if (integration.type !== 'figma') {
      throw new BadRequestException('Integration must be of type figma');
    }

    try {
      const result = await this.figmaService.attachFile(
        {
          workspaceId: integration.workspaceId,
          fileKey,
          projectId,
          taskId,
          createdBy: createdBy || integration.createdBy,
        },
        integration.config,
      );

      await this.createLog(integrationId, 'figma_file_attached', 'success', result.message);
      return result;
    } catch (error) {
      await this.createLog(integrationId, 'figma_file_attached', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async getFigmaFiles(workspaceId: string, projectId?: string, taskId?: string) {
    return this.figmaService.getFiles({ workspaceId, projectId, taskId });
  }

  async syncFigmaFile(integrationId: string, fileKey: string) {
    const integration = await this.findOne(integrationId);

    if (integration.type !== 'figma') {
      throw new BadRequestException('Integration must be of type figma');
    }

    try {
      const result = await this.figmaService.syncFile(fileKey, integration.config);
      await this.createLog(integrationId, 'figma_file_synced', 'success', result.message);
      return result;
    } catch (error) {
      await this.createLog(integrationId, 'figma_file_synced', 'error', getErrorMessage(error));
      throw error;
    }
  }

  // ==================== CLOUD STORAGE METHODS ====================

  async attachCloudFile(
    integrationId: string,
    fileId: string,
    projectId?: string,
    taskId?: string,
    createdBy?: string,
  ) {
    const integration = await this.findOne(integrationId);

    if (!['google_drive', 'dropbox'].includes(integration.type)) {
      throw new BadRequestException('Integration must be google_drive or dropbox');
    }

    try {
      const result = await this.cloudStorageService.attachFile(
        {
          workspaceId: integration.workspaceId,
          fileId,
          projectId,
          taskId,
          createdBy: createdBy || integration.createdBy,
        },
        { provider: integration.type as any, accessToken: integration.config.accessToken },
      );

      await this.createLog(integrationId, 'cloud_file_attached', 'success', result.message);
      return result;
    } catch (error) {
      await this.createLog(integrationId, 'cloud_file_attached', 'error', getErrorMessage(error));
      throw error;
    }
  }

  async getCloudFiles(workspaceId: string, projectId?: string, taskId?: string, provider?: string) {
    return this.cloudStorageService.getFiles({ workspaceId, projectId, taskId, provider });
  }

  // ==================== WEBHOOK METHODS ====================

  async createWebhookEndpoint(
    workspaceId: string,
    name: string,
    provider: 'zapier' | 'make' | 'custom',
    events: string[],
    createdBy: string,
    description?: string,
  ) {
    try {
      const result = await this.webhookService.createEndpoint({
        workspaceId,
        name,
        description,
        provider,
        events,
        createdBy,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getWebhookEndpoints(workspaceId: string) {
    return this.webhookService.getEndpoints(workspaceId);
  }

  async updateWebhookEndpoint(endpointId: string, updates: any) {
    return this.webhookService.updateEndpoint(endpointId, updates);
  }

  async deleteWebhookEndpoint(endpointId: string) {
    return this.webhookService.deleteEndpoint(endpointId);
  }

  async triggerWebhooks(workspaceId: string, event: string, payload: any) {
    return this.webhookService.triggerWebhooks({ workspaceId, event, payload });
  }

  async getWebhookLogs(endpointId: string, options?: { limit?: number; status?: string }) {
    return this.webhookService.getCallLogs(endpointId, options);
  }

  async handleIncomingWebhook(url: string, payload: any, signature?: string) {
    return this.webhookService.handleIncomingWebhook(url, payload, signature);
  }

  private async createLog(integrationId: string, action: string, status: string, message?: string, metadata?: any) {
    await (this.prisma as any).integrationLog.create({
      data: {
        integrationId,
        action,
        status,
        message,
        metadata,
      },
    });
  }
}
