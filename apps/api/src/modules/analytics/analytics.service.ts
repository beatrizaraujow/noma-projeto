import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

type SignupMethod = 'email' | 'google' | 'unknown';

type SignupEventMetadata = {
  method: SignupMethod;
  workspaceId: string | null;
  source: string | null;
  utmSource: string | null;
  campaign: string | null;
  inviteToken: string | null;
};

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getSignupMetrics(workspaceId: string, userId: string, days: number = 30) {
    await this.verifyWorkspaceAccess(workspaceId, userId);

    const periodDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 365) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const signupLogs = await this.prisma.auditLog.findMany({
      where: {
        action: 'signup',
        resource: 'auth',
        createdAt: { gte: startDate },
      },
      select: {
        userId: true,
        createdAt: true,
        metadata: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const workspaceSignups = signupLogs.filter((log) => {
      const metadata = this.extractSignupMetadata(log.metadata);
      return metadata.workspaceId === workspaceId;
    });

    const byMethod: Record<SignupMethod, number> = {
      email: 0,
      google: 0,
      unknown: 0,
    };

    const bySourceMap = new Map<string, number>();
    const dailyMap = new Map<string, number>();
    const signupUserIds = new Set<string>();

    for (const signup of workspaceSignups) {
      signupUserIds.add(signup.userId);

      const metadata = this.extractSignupMetadata(signup.metadata);
      byMethod[metadata.method] = (byMethod[metadata.method] || 0) + 1;

      const sourceLabel =
        metadata.utmSource ||
        metadata.campaign ||
        metadata.source ||
        (metadata.inviteToken ? 'invite' : 'unknown');
      bySourceMap.set(sourceLabel, (bySourceMap.get(sourceLabel) || 0) + 1);

      const dateLabel = signup.createdAt.toISOString().split('T')[0];
      dailyMap.set(dateLabel, (dailyMap.get(dateLabel) || 0) + 1);
    }

    const userIds = [...signupUserIds];

    let createdProject = 0;
    let firstTaskEngaged = 0;

    if (userIds.length > 0) {
      const [projectOwners, taskAssignees] = await Promise.all([
        this.prisma.project.findMany({
          where: {
            workspaceId,
            ownerId: { in: userIds },
          },
          select: {
            ownerId: true,
          },
          distinct: ['ownerId'],
        }),
        this.prisma.task.findMany({
          where: {
            project: { workspaceId },
            assigneeId: { in: userIds },
          },
          select: {
            assigneeId: true,
          },
          distinct: ['assigneeId'],
        }),
      ]);

      createdProject = projectOwners.length;
      firstTaskEngaged = taskAssignees.filter((entry) => Boolean(entry.assigneeId)).length;
    }

    const totalSignups = workspaceSignups.length;
    const activationRate =
      totalSignups > 0
        ? Math.round((firstTaskEngaged / totalSignups) * 1000) / 10
        : 0;

    return {
      periodDays,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      totalSignups,
      byMethod,
      bySource: [...bySourceMap.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
      daily: [...dailyMap.entries()]
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      activationFunnel: {
        signedUp: totalSignups,
        createdProject,
        firstTaskEngaged,
        activationRate,
      },
    };
  }

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
          some: { userId },
        },
      },
    });

    if (!membership) {
      throw new Error('Access denied to workspace');
    }
  }

  private extractSignupMetadata(metadata: unknown): SignupEventMetadata {
    const safeMethod = (value: unknown): SignupMethod => {
      if (value === 'email' || value === 'google') {
        return value;
      }

      return 'unknown';
    };

    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
      return {
        method: 'unknown',
        workspaceId: null,
        source: null,
        utmSource: null,
        campaign: null,
        inviteToken: null,
      };
    }

    const typed = metadata as Record<string, unknown>;

    return {
      method: safeMethod(typed.method),
      workspaceId: typeof typed.workspaceId === 'string' ? typed.workspaceId : null,
      source: typeof typed.source === 'string' ? typed.source : null,
      utmSource: typeof typed.utmSource === 'string' ? typed.utmSource : null,
      campaign: typeof typed.campaign === 'string' ? typed.campaign : null,
      inviteToken: typeof typed.inviteToken === 'string' ? typed.inviteToken : null,
    };
  }
}
