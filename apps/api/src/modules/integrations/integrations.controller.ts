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
  Headers,
  ForbiddenException,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto, UpdateIntegrationDto, TestIntegrationDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  private async assertWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    const role = await this.workspacesService.getMemberRole(workspaceId, userId);
    if (!role) {
      throw new ForbiddenException('Access denied for this workspace');
    }
  }

  private async getAuthorizedIntegration(id: string, userId: string): Promise<any> {
    const integration = await this.integrationsService.findOne(id);
    await this.assertWorkspaceAccess(integration.workspaceId, userId);
    return integration;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: CreateIntegrationDto, @Request() req) {
    await this.assertWorkspaceAccess(createDto.workspaceId, req.user.userId);

    return this.integrationsService.create({
      ...createDto,
      createdBy: req.user?.userId,
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('workspaceId') workspaceId: string, @Request() req) {
    await this.assertWorkspaceAccess(workspaceId, req.user.userId);
    return this.integrationsService.findAll(workspaceId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req) {
    await this.getAuthorizedIntegration(id, req.user.userId);
    return this.integrationsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateDto: UpdateIntegrationDto, @Request() req) {
    await this.getAuthorizedIntegration(id, req.user.userId);
    return this.integrationsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Request() req) {
    await this.getAuthorizedIntegration(id, req.user.userId);
    return this.integrationsService.remove(id);
  }

  @Post(':id/test')
  @UseGuards(JwtAuthGuard)
  async test(@Param('id') id: string, @Body() testDto: TestIntegrationDto, @Request() req) {
    await this.getAuthorizedIntegration(id, req.user.userId);
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
  @UseGuards(JwtAuthGuard)
  async slackNotify(@Body() body: any, @Request() req) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    return this.integrationsService.sendSlackNotification(
      body.integrationId,
      body.message,
      body.channel,
    );
  }

  @Post('discord/notify')
  @UseGuards(JwtAuthGuard)
  async discordNotify(@Body() body: any, @Request() req) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    return this.integrationsService.sendDiscordNotification(
      body.integrationId,
      body.message,
      body.channel,
    );
  }

  @Post('email/sync')
  @UseGuards(JwtAuthGuard)
  async emailSync(@Body() body: { integrationId: string }, @Request() req) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    return this.integrationsService.syncEmail(body.integrationId);
  }

  @Post('calendar/sync')
  @UseGuards(JwtAuthGuard)
  async calendarSync(@Body() body: { integrationId: string }, @Request() req) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    return this.integrationsService.syncCalendar(body.integrationId);
  }

  // ==================== GITHUB ENDPOINTS ====================

  @Post('github/link-pr')
  @UseGuards(JwtAuthGuard)
  async linkPRToTask(
    @Body() body: { integrationId: string; taskId: string; repository: string; prNumber: number },
    @Request() req,
  ) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    await this.integrationsService.assertTaskAccess(body.taskId, req.user.userId);

    return this.integrationsService.linkPRToTask(
      body.integrationId,
      body.taskId,
      body.repository,
      body.prNumber,
    );
  }

  @Post('github/sync-repository')
  @UseGuards(JwtAuthGuard)
  async syncGitHubRepository(
    @Body() body: { integrationId: string; repository: string },
    @Request() req,
  ) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    return this.integrationsService.syncGitHubRepository(body.integrationId, body.repository);
  }

  @Get('github/task/:taskId/prs')
  @UseGuards(JwtAuthGuard)
  async getPRsForTask(@Param('taskId') taskId: string, @Request() req) {
    await this.integrationsService.assertTaskAccess(taskId, req.user.userId);
    return this.integrationsService.getPRsForTask(taskId);
  }

  @Post('github/webhook')
  async handleGitHubWebhook(
    @Body() payload: any,
    @Query('workspaceId') workspaceId: string,
    @Headers('x-github-event') githubEvent?: string,
  ) {
    const event = githubEvent || 'unknown';
    return this.integrationsService.handleGitHubWebhook(event, payload, workspaceId);
  }

  // ==================== FIGMA ENDPOINTS ====================

  @Post('figma/attach')
  @UseGuards(JwtAuthGuard)
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
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);

    return this.integrationsService.attachFigmaFile(
      body.integrationId,
      body.fileKey,
      body.projectId,
      body.taskId,
      req.user?.userId,
    );
  }

  @Get('figma/files')
  @UseGuards(JwtAuthGuard)
  async getFigmaFiles(
    @Request() req,
    @Query('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
  ) {
    await this.assertWorkspaceAccess(workspaceId, req.user.userId);
    return this.integrationsService.getFigmaFiles(workspaceId, projectId, taskId);
  }

  @Post('figma/sync')
  @UseGuards(JwtAuthGuard)
  async syncFigmaFile(@Body() body: { integrationId: string; fileKey: string }, @Request() req) {
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);
    return this.integrationsService.syncFigmaFile(body.integrationId, body.fileKey);
  }

  // ==================== CLOUD STORAGE ENDPOINTS ====================

  @Post('cloud/attach')
  @UseGuards(JwtAuthGuard)
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
    await this.getAuthorizedIntegration(body.integrationId, req.user.userId);

    return this.integrationsService.attachCloudFile(
      body.integrationId,
      body.fileId,
      body.projectId,
      body.taskId,
      req.user?.userId,
    );
  }

  @Get('cloud/files')
  @UseGuards(JwtAuthGuard)
  async getCloudFiles(
    @Request() req,
    @Query('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
    @Query('taskId') taskId?: string,
    @Query('provider') provider?: string,
  ) {
    await this.assertWorkspaceAccess(workspaceId, req.user.userId);
    return this.integrationsService.getCloudFiles(
      workspaceId,
      projectId,
      taskId,
      provider,
    );
  }

  // ==================== WEBHOOK ENDPOINTS ====================

  @Post('webhooks/create')
  @UseGuards(JwtAuthGuard)
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
    await this.assertWorkspaceAccess(body.workspaceId, req.user.userId);

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
  @UseGuards(JwtAuthGuard)
  async getWebhookEndpoints(@Query('workspaceId') workspaceId: string, @Request() req) {
    await this.assertWorkspaceAccess(workspaceId, req.user.userId);
    return this.integrationsService.getWebhookEndpoints(workspaceId);
  }

  @Put('webhooks/:id')
  @UseGuards(JwtAuthGuard)
  async updateWebhookEndpoint(@Param('id') id: string, @Body() updates: any, @Request() req) {
    await this.integrationsService.assertWebhookEndpointAccess(id, req.user.userId);
    return this.integrationsService.updateWebhookEndpoint(id, updates);
  }

  @Delete('webhooks/:id')
  @UseGuards(JwtAuthGuard)
  async deleteWebhookEndpoint(@Param('id') id: string, @Request() req) {
    await this.integrationsService.assertWebhookEndpointAccess(id, req.user.userId);
    return this.integrationsService.deleteWebhookEndpoint(id);
  }

  @Get('webhooks/:id/logs')
  @UseGuards(JwtAuthGuard)
  async getWebhookLogs(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    await this.integrationsService.assertWebhookEndpointAccess(id, req.user.userId);
    return this.integrationsService.getWebhookLogs(id, {
      limit: limit ? parseInt(limit) : 50,
      status,
    });
  }

  @Post('webhooks/trigger')
  @UseGuards(JwtAuthGuard)
  async triggerWebhooks(
    @Body() body: { workspaceId: string; event: string; payload: any },
    @Request() req,
  ) {
    await this.assertWorkspaceAccess(body.workspaceId, req.user.userId);
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
