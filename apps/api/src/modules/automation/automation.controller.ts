import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('automation')
@UseGuards(JwtAuthGuard)
export class AutomationController {
  constructor(private automationService: AutomationService) {}

  // ==================== TRIGGERS ====================

  @Post('triggers')
  async createTrigger(@Body() body: any, @Req() req: any) {
    const trigger = await this.automationService.createTrigger({
      ...body,
      createdBy: req.user.userId,
    });
    return trigger;
  }

  @Get('triggers')
  async getTriggers(
    @Query('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.automationService.getTriggers(workspaceId, projectId);
  }

  @Put('triggers/:id')
  async updateTrigger(@Param('id') id: string, @Body() body: any) {
    return this.automationService.updateTrigger(id, body);
  }

  @Delete('triggers/:id')
  async deleteTrigger(@Param('id') id: string) {
    return this.automationService.deleteTrigger(id);
  }

  // ==================== PROJECT TEMPLATES ====================

  @Post('templates')
  async createProjectTemplate(@Body() body: any, @Req() req: any) {
    const template = await this.automationService.createProjectTemplate({
      ...body,
      createdBy: req.user.userId,
    });
    return template;
  }

  @Get('templates')
  async getProjectTemplates(@Query('workspaceId') workspaceId: string) {
    return this.automationService.getProjectTemplates(workspaceId);
  }

  @Post('templates/:templateId/apply')
  async applyProjectTemplate(
    @Param('templateId') templateId: string,
    @Body() body: { projectId: string },
    @Req() req: any,
  ) {
    return this.automationService.applyProjectTemplate(
      templateId,
      body.projectId,
      req.user.userId,
    );
  }

  // ==================== RECURRING TASKS ====================

  @Post('recurring-tasks')
  async createRecurringTask(@Body() body: any, @Req() req: any) {
    const recurringTask = await this.automationService.createRecurringTask({
      ...body,
      createdBy: req.user.userId,
    });
    return recurringTask;
  }

  @Get('recurring-tasks')
  async getRecurringTasks(@Query('projectId') projectId: string) {
    return this.automationService.getRecurringTasks(projectId);
  }

  @Put('recurring-tasks/:id')
  async updateRecurringTask(@Param('id') id: string, @Body() body: any) {
    return this.automationService.updateRecurringTask(id, body);
  }

  @Delete('recurring-tasks/:id')
  async deleteRecurringTask(@Param('id') id: string) {
    return this.automationService.deleteRecurringTask(id);
  }

  // ==================== BULK ACTIONS ====================

  @Post('bulk-actions')
  async executeBulkAction(@Body() body: any, @Req() req: any) {
    const { action, taskIds, data } = body;

    if (!action || !taskIds || taskIds.length === 0) {
      throw new Error('Invalid bulk action request');
    }

    return this.automationService.executeBulkAction(
      action,
      taskIds,
      data,
      req.user.userId,
    );
  }

  // ==================== AUTO-ASSIGN RULES ====================

  @Post('auto-assign-rules')
  async createAutoAssignRule(@Body() body: any, @Req() req: any) {
    const rule = await this.automationService.createAutoAssignRule({
      ...body,
      createdBy: req.user.userId,
    });
    return rule;
  }

  @Get('auto-assign-rules')
  async getAutoAssignRules(
    @Query('workspaceId') workspaceId: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.automationService.getAutoAssignRules(workspaceId, projectId);
  }

  @Put('auto-assign-rules/:id')
  async updateAutoAssignRule(@Param('id') id: string, @Body() body: any) {
    return this.automationService.updateAutoAssignRule(id, body);
  }

  @Delete('auto-assign-rules/:id')
  async deleteAutoAssignRule(@Param('id') id: string) {
    return this.automationService.deleteAutoAssignRule(id);
  }

  @Post('auto-assign-rules/apply/:taskId')
  async applyAutoAssignRules(@Param('taskId') taskId: string, @Body() body: any) {
    return this.automationService.applyAutoAssignRules(taskId, body.task);
  }
}
