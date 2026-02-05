import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto, UpdateIntegrationDto, TestIntegrationDto } from './dto';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post()
  async create(@Body() createDto: CreateIntegrationDto, @Request() req) {
    return this.integrationsService.create({
      ...createDto,
      createdBy: req.user?.userId,
    });
  }

  @Get()
  async findAll(@Query('workspaceId') workspaceId: string) {
    return this.integrationsService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateIntegrationDto) {
    return this.integrationsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.integrationsService.remove(id);
  }

  @Post(':id/test')
  async test(@Param('id') id: string, @Body() testDto: TestIntegrationDto) {
    return this.integrationsService.test(id, testDto);
  }

  @Get(':id/logs')
  async getLogs(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.integrationsService.getLogs(id, {
      limit: limit ? parseInt(limit) : 50,
      status,
    });
  }

  @Post('slack/notify')
  async slackNotify(@Body() body: any) {
    return this.integrationsService.sendSlackNotification(
      body.integrationId,
      body.message,
      body.channel,
    );
  }

  @Post('discord/notify')
  async discordNotify(@Body() body: any) {
    return this.integrationsService.sendDiscordNotification(
      body.integrationId,
      body.message,
      body.channel,
    );
  }

  @Post('email/sync')
  async emailSync(@Body() body: { integrationId: string }) {
    return this.integrationsService.syncEmail(body.integrationId);
  }

  @Post('calendar/sync')
  async calendarSync(@Body() body: { integrationId: string }) {
    return this.integrationsService.syncCalendar(body.integrationId);
  }

  // ==================== GITHUB ENDPOINTS ====================

  @Post('github/link-pr')
  async linkPRToTask(
    @Body() body: { integrationId: string; taskId: string; repository: string; prNumber: number },
  ) {
    return this.integrationsService.linkPRToTask(
      body.integrationId,
      body.taskId,
      body.repository,
      body.prNumber,
    );
  }

  @Post('github/sync-repository')
  async syncGitHubRepository(
    @Body() body: { integrationId: string; repository: string },
  ) {
    return this.integrationsService.syncGitHubRepository(body.integrationId, body.repository);
  }

  @Get('github/task/:taskId/prs')
  async getPRsForTask(@Param('taskId') taskId: string) {
    return this.integrationsService.getPRsForTask(taskId);
  }

  @Post('github/webhook')
  async handleGitHubWebhook(
    @Body() payload: any,
    @Query('workspaceId') workspaceId: string,
  ) {
    const event = payload.action || 'unknown';
    return this.integrationsService.handleGitHubWebhook(event, payload, workspaceId);
  }

  // ==================== FIGMA ENDPOINTS ====================

  @Post('figma/attach')
  async attachFigmaFile(
    @Body()
    body: {
      integrationId: string;
      fileKey: string;
      projectId?: string;
      taskId?: string;
    },
    @Request() req,
  ) {
    return this.integrationsService.attachFigmaFile(
      body.integrationId,
      body.fileKey,
      body.projectId,
      body.taskId,
      req.user?.userId,
    );
  }

  @Get('figma/files')
  async getFigmaFiles(
    @Query('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
  ) {
    return this.integrationsService.getFigmaFiles(workspaceId, projectId, taskId);
  }

  @Post('figma/sync')
  async syncFigmaFile(@Body() body: { integrationId: string; fileKey: string }) {
    return this.integrationsService.syncFigmaFile(body.integrationId, body.fileKey);
  }

  // ==================== CLOUD STORAGE ENDPOINTS ====================

  @Post('cloud/attach')
  async attachCloudFile(
    @Body()
    body: {
      integrationId: string;
      fileId: string;
      projectId?: string;
      taskId?: string;
    },
    @Request() req,
  ) {
    return this.integrationsService.attachCloudFile(
      body.integrationId,
      body.fileId,
      body.projectId,
      body.taskId,
      req.user?.userId,
    );
  }

  @Get('cloud/files')
  async getCloudFiles(
    @Query('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @Query('provider') provider?: string,
  ) {
    return this.integrationsService.getCloudFiles(
      workspaceId,
      projectId,
      taskId,
      provider,
    );
  }

  // ==================== WEBHOOK ENDPOINTS ====================

  @Post('webhooks/create')
  async createWebhookEndpoint(
    @Body()
    body: {
      workspaceId: string;
      name: string;
      provider: 'zapier' | 'make' | 'custom';
      events: string[];
      description?: string;
    },
    @Request() req,
  ) {
    return this.integrationsService.createWebhookEndpoint(
      body.workspaceId,
      body.name,
      body.provider,
      body.events,
      req.user?.userId,
      body.description,
    );
  }

  @Get('webhooks')
  async getWebhookEndpoints(@Query('workspaceId') workspaceId: string) {
    return this.integrationsService.getWebhookEndpoints(workspaceId);
  }

  @Put('webhooks/:id')
  async updateWebhookEndpoint(@Param('id') id: string, @Body() updates: any) {
    return this.integrationsService.updateWebhookEndpoint(id, updates);
  }

  @Delete('webhooks/:id')
  async deleteWebhookEndpoint(@Param('id') id: string) {
    return this.integrationsService.deleteWebhookEndpoint(id);
  }

  @Get('webhooks/:id/logs')
  async getWebhookLogs(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.integrationsService.getWebhookLogs(id, {
      limit: limit ? parseInt(limit) : 50,
      status,
    });
  }

  @Post('webhooks/trigger')
  async triggerWebhooks(
    @Body() body: { workspaceId: string; event: string; payload: any },
  ) {
    return this.integrationsService.triggerWebhooks(
      body.workspaceId,
      body.event,
      body.payload,
    );
  }

  @Post('webhooks/incoming/:workspaceId/:uniqueId')
  async handleIncomingWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('uniqueId') uniqueId: string,
    @Body() payload: any,
    @Request() req,
  ) {
    const url = `/api/webhooks/${workspaceId}/${uniqueId}`;
    const signature = req.headers['x-webhook-signature'];
    return this.integrationsService.handleIncomingWebhook(url, payload, signature);
  }
}
