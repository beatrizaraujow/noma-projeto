import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('workflows')
@UseGuards(AuthGuard('jwt'))
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // ==================== WORKFLOW MANAGEMENT ====================

  @Post()
  async createWorkflow(@Body() body: any, @Request() req) {
    return this.workflowService.createWorkflow(
      {
        ...body,
        createdBy: req.user.userId,
      },
      req.user.userId,
    );
  }

  @Get(':id')
  async getWorkflow(@Param('id') id: string, @Request() req) {
    return this.workflowService.getWorkflow(id, req.user.userId);
  }

  @Get('workspace/:workspaceId')
  async listWorkflows(@Param('workspaceId') workspaceId: string, @Request() req) {
    return this.workflowService.listWorkflows(workspaceId, req.user.userId);
  }

  @Put(':id')
  async updateWorkflow(@Param('id') id: string, @Body() body: any, @Request() req) {
    return this.workflowService.updateWorkflow(id, body, req.user.userId);
  }

  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string, @Request() req) {
    return this.workflowService.deleteWorkflow(id, req.user.userId);
  }

  // ==================== WORKFLOW EXECUTION ====================

  @Post(':id/execute')
  async executeWorkflow(
    @Param('id') id: string,
    @Body() body: { input?: any; triggeredBy?: string },
    @Request() req,
  ) {
    return this.workflowService.executeWorkflow(id, req.user.userId, body.input, body.triggeredBy);
  }

  @Get(':id/executions')
  async listWorkflowExecutions(
    @Request() req,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.workflowService.listWorkflowExecutions(id, req.user.userId, limit ? parseInt(limit) : 50);
  }

  @Get('executions/:executionId')
  async getWorkflowExecution(@Param('executionId') executionId: string, @Request() req) {
    return this.workflowService.getWorkflowExecution(executionId, req.user.userId);
  }

  @Post('executions/:executionId/cancel')
  async cancelWorkflowExecution(@Param('executionId') executionId: string, @Request() req) {
    return this.workflowService.cancelWorkflowExecution(executionId, req.user.userId);
  }

  // ==================== WEBHOOK TRIGGERS ====================

  @Post('webhooks')
  async createWebhookTrigger(@Body() body: any, @Request() req) {
    return this.workflowService.createWebhookTrigger(
      {
        ...body,
        createdBy: req.user.userId,
      },
      req.user.userId,
    );
  }

  @Get('webhooks/workspace/:workspaceId')
  async listWebhookTriggers(@Param('workspaceId') workspaceId: string, @Request() req) {
    return this.workflowService.listWebhookTriggers(workspaceId, req.user.userId);
  }

  @Delete('webhooks/:id')
  async deleteWebhookTrigger(@Param('id') id: string, @Request() req) {
    return this.workflowService.deleteWebhookTrigger(id, req.user.userId);
  }

  @Post('webhooks/:url/trigger')
  async executeWebhookTrigger(
    @Param('url') url: string,
    @Body() payload: any,
    @Query('signature') signature?: string,
  ) {
    return this.workflowService.executeWebhookTrigger(url, payload, signature);
  }
}
