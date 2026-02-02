import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('workspaces/:workspaceId/dashboard')
  async getWorkspaceDashboard(@Param('workspaceId') workspaceId: string, @Req() req: any) {
    return this.analyticsService.getWorkspaceDashboard(workspaceId, req.user.userId);
  }

  @Get('workspaces/:workspaceId/project-progress')
  async getProjectProgress(@Param('workspaceId') workspaceId: string, @Req() req: any) {
    return this.analyticsService.getProjectProgress(workspaceId, req.user.userId);
  }

  @Get('workspaces/:workspaceId/team-productivity')
  async getTeamProductivity(@Param('workspaceId') workspaceId: string, @Req() req: any) {
    return this.analyticsService.getTeamProductivity(workspaceId, req.user.userId);
  }

  @Get('workspaces/:workspaceId/activity-trend')
  async getActivityTrend(
    @Param('workspaceId') workspaceId: string,
    @Query('days') days: string,
    @Req() req: any,
  ) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getActivityTrend(workspaceId, req.user.userId, daysNumber);
  }

  @Get('workspaces/:workspaceId/task-distribution')
  async getTaskDistribution(@Param('workspaceId') workspaceId: string, @Req() req: any) {
    return this.analyticsService.getTaskDistribution(workspaceId, req.user.userId);
  }

  @Get('workspaces/:workspaceId/export')
  async exportDashboard(
    @Param('workspaceId') workspaceId: string,
    @Query('format') format: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const data = await this.analyticsService.exportDashboardData(workspaceId, req.user.userId);

    if (format === 'csv') {
      return this.exportAsCSV(data, res);
    }

    // Default to JSON
    return res.json(data);
  }

  private exportAsCSV(data: any, res: Response) {
    const csvRows: string[] = [];

    // Workspace Info
    csvRows.push('Workspace Dashboard Export');
    csvRows.push(`Workspace: ${data.workspace.name}`);
    csvRows.push(`Export Date: ${data.exportDate}`);
    csvRows.push('');

    // Overview
    csvRows.push('Overview Metrics');
    csvRows.push('Metric,Value');
    csvRows.push(`Total Projects,${data.dashboard.overview.totalProjects}`);
    csvRows.push(`Total Tasks,${data.dashboard.overview.totalTasks}`);
    csvRows.push(`Total Members,${data.dashboard.overview.totalMembers}`);
    csvRows.push(`Completed Tasks,${data.dashboard.overview.completedTasks}`);
    csvRows.push(`Overdue Tasks,${data.dashboard.overview.overdueTasks}`);
    csvRows.push(`Completion Rate,${data.dashboard.overview.completionRate}%`);
    csvRows.push('');

    // Project Progress
    csvRows.push('Project Progress');
    csvRows.push('Project,Total Tasks,Completed,In Progress,Todo,Overdue,Completion Rate');
    data.projectProgress.forEach((project: any) => {
      csvRows.push(
        `${project.projectName},${project.totalTasks},${project.completedTasks},${project.inProgressTasks},${project.todoTasks},${project.overdueTasks},${project.completionRate}%`,
      );
    });
    csvRows.push('');

    // Team Productivity
    csvRows.push('Team Productivity');
    csvRows.push('Team Member,Assigned Tasks,Completed Tasks,Completion Rate,Activities,Comments');
    data.teamProductivity.memberMetrics.forEach((member: any) => {
      csvRows.push(
        `${member.user.name},${member.assignedTasks},${member.completedTasks},${member.completionRate}%,${member.activitiesCount},${member.commentsCount}`,
      );
    });

    const csvContent = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=dashboard-export-${Date.now()}.csv`,
    );
    return res.send(csvContent);
  }
}
