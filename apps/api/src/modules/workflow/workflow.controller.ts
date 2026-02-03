import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('workflows')
@UseGuards(AuthGuard('jwt'))
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  // ==================== WORKFLOW MANAGEMENT ====================

  @Post()
  async createWorkflow(@Body() body: any) {
    return this.workflowService.createWorkflow(body);
  }

  @Get(':id')
  async getWorkflow(@Param('id') id: string) {
    return this.workflowService.getWorkflow(id);
  }

  @Get('workspace/:workspaceId')
  async listWorkflows(@Param('workspaceId') workspaceId: string) {
    return this.workflowService.listWorkflows(workspaceId);
  }

  @Put(':id')
  async updateWorkflow(@Param('id') id: string, @Body() body: any) {
    return this.workflowService.updateWorkflow(id, body);
  }

  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string) {
    return this.workflowService.deleteWorkflow(id);
  }

  // ==================== WORKFLOW EXECUTION ====================

  @Post(':id/execute')
  async executeWorkflow(
    @Param('id') id: string,
    @Body() body: { input?: any; triggeredBy?: string },
  ) {
    return this.workflowService.executeWorkflow(id, body.input, body.triggeredBy);
  }

  @Get(':id/executions')
  async listWorkflowExecutions(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.workflowService.listWorkflowExecutions(id, limit ? parseInt(limit) : 50);
  }

  @Get('executions/:executionId')
  async getWorkflowExecution(@Param('executionId') executionId: string) {
    return this.workflowService.getWorkflowExecution(executionId);
  }

  @Post('executions/:executionId/cancel')
  async cancelWorkflowExecution(@Param('executionId') executionId: string) {
    return this.workflowService.cancelWorkflowExecution(executionId);
  }

  // ==================== WEBHOOK TRIGGERS ====================

  @Post('webhooks')
  async createWebhookTrigger(@Body() body: any) {
    return this.workflowService.createWebhookTrigger(body);
  }

  @Get('webhooks/workspace/:workspaceId')
  async listWebhookTriggers(@Param('workspaceId') workspaceId: string) {
    return this.workflowService.listWebhookTriggers(workspaceId);
  }

  @Delete('webhooks/:id')
  async deleteWebhookTrigger(@Param('id') id: string) {
    return this.workflowService.deleteWebhookTrigger(id);
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
