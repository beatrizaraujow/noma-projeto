import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getWorkspaceDashboard(workspaceId: string, userId: string) {
    // Verify user access
    await this.verifyWorkspaceAccess(workspaceId, userId);

    // Get all project IDs for this workspace
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const [
      totalProjects,
      totalTasks,
      totalMembers,
      completedTasks,
      overdueTasks,
      recentActivity,
    ] = await Promise.all([
      this.prisma.project.count({ where: { workspaceId } }),
      this.prisma.task.count({
        where: { project: { workspaceId } },
      }),
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { _count: { select: { members: true } } },
      }),
      this.prisma.task.count({
        where: {
          project: { workspaceId },
          status: 'DONE',
        },
      }),
      this.prisma.task.count({
        where: {
          project: { workspaceId },
          status: { not: 'DONE' },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.activity.findMany({
        where: { projectId: { in: projectIds } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      overview: {
        totalProjects,
        totalTasks,
        totalMembers: totalMembers?._count.members || 0,
        completedTasks,
        overdueTasks,
        completionRate: Math.round(completionRate * 10) / 10,
      },
      recentActivity,
    };
  }

  async getProjectProgress(workspaceId: string, userId: string) {
    await this.verifyWorkspaceAccess(workspaceId, userId);

    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });

    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        const [totalTasks, completedTasks, inProgressTasks, todoTasks] =
          await Promise.all([
            this.prisma.task.count({ where: { projectId: project.id } }),
            this.prisma.task.count({
              where: { projectId: project.id, status: 'DONE' },
            }),
            this.prisma.task.count({
              where: { projectId: project.id, status: 'IN_PROGRESS' },
            }),
            this.prisma.task.count({
              where: { projectId: project.id, status: 'TODO' },
            }),
          ]);

        const completionRate =
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Get task distribution by priority
        const tasksByPriority = await this.prisma.task.groupBy({
          by: ['priority'],
          where: { projectId: project.id },
          _count: true,
        });

        // Get overdue tasks
        const overdueTasks = await this.prisma.task.count({
          where: {
            projectId: project.id,
            status: { not: 'DONE' },
            dueDate: { lt: new Date() },
          },
        });

        return {
          projectId: project.id,
          projectName: project.name,
          projectColor: project.color,
          projectIcon: project.icon,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          completionRate: Math.round(completionRate * 10) / 10,
          tasksByPriority: tasksByPriority.map((item) => ({
            priority: item.priority,
            count: item._count,
          })),
        };
      })
    );

    return projectProgress;
  }

  async getTeamProductivity(workspaceId: string, userId: string) {
    await this.verifyWorkspaceAccess(workspaceId, userId);

    // Get all project IDs for this workspace
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    // Get all tasks for this workspace to query comments
    const tasks = await this.prisma.task.findMany({
      where: { project: { workspaceId } },
      select: { id: true },
    });
    const taskIds = tasks.map((t) => t.id);

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const memberMetrics = await Promise.all(
      workspace.members.map(async (memberRel) => {
        const member = memberRel.user;
        const [
          assignedTasks,
          completedTasks,
          activitiesCount,
          commentsCount,
        ] = await Promise.all([
          this.prisma.task.count({
            where: {
              assigneeId: member.id,
              project: { workspaceId },
            },
          }),
          this.prisma.task.count({
            where: {
              assigneeId: member.id,
              project: { workspaceId },
              status: 'DONE',
            },
          }),
          this.prisma.activity.count({
            where: {
              userId: member.id,
              projectId: { in: projectIds },
            },
          }),
          this.prisma.comment.count({
            where: {
              authorId: member.id,
              taskId: { in: taskIds },
            },
          }),
        ]);

        const completionRate =
          assignedTasks > 0 ? (completedTasks / assignedTasks) * 100 : 0;

        // Get activity trend (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivities = await this.prisma.activity.findMany({
          where: {
            userId: member.id,
            projectId: { in: projectIds },
            createdAt: { gte: sevenDaysAgo },
          },
          select: {
            type: true,
          },
        });

        // Group manually
        const activityGroups = recentActivities.reduce((acc, activity) => {
          acc[activity.type] = (acc[activity.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const recentActivitiesGrouped = Object.entries(activityGroups).map(
          ([type, count]) => ({ type, count })
        );

        return {
          user: member,
          assignedTasks,
          completedTasks,
          completionRate: Math.round(completionRate * 10) / 10,
          activitiesCount,
          commentsCount,
          recentActivities: recentActivitiesGrouped,
        };
      })
    );

    // Calculate team averages
    const totalCompleted = memberMetrics.reduce(
      (sum, m) => sum + m.completedTasks,
      0
    );
    const totalAssigned = memberMetrics.reduce(
      (sum, m) => sum + m.assignedTasks,
      0
    );
    const averageCompletionRate =
      memberMetrics.length > 0
        ? memberMetrics.reduce((sum, m) => sum + m.completionRate, 0) /
          memberMetrics.length
        : 0;

    return {
      memberMetrics: memberMetrics.sort(
        (a, b) => b.completedTasks - a.completedTasks
      ),
      teamAverages: {
        totalAssigned,
        totalCompleted,
        averageCompletionRate: Math.round(averageCompletionRate * 10) / 10,
      },
    };
  }

  async getActivityTrend(
    workspaceId: string,
    userId: string,
    days: number = 30
  ) {
    await this.verifyWorkspaceAccess(workspaceId, userId);

    // Get all project IDs for this workspace
    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await this.prisma.activity.findMany({
      where: {
        projectId: { in: projectIds },
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        type: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date
    const activityByDate: Record<string, number> = {};
    activities.forEach((activity) => {
      const date = activity.createdAt.toISOString().split('T')[0];
      activityByDate[date] = (activityByDate[date] || 0) + 1;
    });

    return Object.entries(activityByDate).map(([date, count]) => ({
      date,
      count,
    }));
  }

  async getTaskDistribution(workspaceId: string, userId: string) {
    await this.verifyWorkspaceAccess(workspaceId, userId);

    const [byStatus, byPriority] = await Promise.all([
      this.prisma.task.groupBy({
        by: ['status'],
        where: { project: { workspaceId } },
        _count: true,
      }),
      this.prisma.task.groupBy({
        by: ['priority'],
        where: { project: { workspaceId } },
        _count: true,
      }),
    ]);

    return {
      byStatus: byStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      byPriority: byPriority.map((item) => ({
        priority: item.priority,
        count: item._count,
      })),
    };
  }

  async exportDashboardData(workspaceId: string, userId: string) {
    await this.verifyWorkspaceAccess(workspaceId, userId);

    const [dashboard, projectProgress, teamProductivity, taskDistribution] =
      await Promise.all([
        this.getWorkspaceDashboard(workspaceId, userId),
        this.getProjectProgress(workspaceId, userId),
        this.getTeamProductivity(workspaceId, userId),
        this.getTaskDistribution(workspaceId, userId),
      ]);

    return {
      workspace: await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, name: true },
      }),
      exportDate: new Date().toISOString(),
      dashboard,
      projectProgress,
      teamProductivity,
      taskDistribution,
    };
  }

  private async verifyWorkspaceAccess(workspaceId: string, userId: string) {
    const membership = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        members: {
          some: { id: userId },
        },
      },
    });

    if (!membership) {
      throw new Error('Access denied to workspace');
    }
  }
}
