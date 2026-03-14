import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findByProject(projectId: string, userId: string) {
    // Verify user has access to project
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const hasAccess = project.workspace.members.some(
      (member) => member.userId === userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this project');
    }

    const activities = await this.prisma.activity.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return activities.map((activity) => this.normalizeActivityMetadata(activity));
  }

  async findByTask(taskId: string, userId: string) {
    // Verify user has access to task
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess = task.project.workspace.members.some(
      (member) => member.userId === userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    const activities = await this.prisma.activity.findMany({
      where: { taskId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return activities.map((activity) => this.normalizeActivityMetadata(activity));
  }

  async createActivity(data: {
    type: string;
    description: string;
    projectId?: string;
    taskId?: string;
    userId: string;
    metadata?: any;
  }) {
    const activity = await this.prisma.activity.create({
      data: {
        type: data.type,
        description: data.description,
        projectId: data.projectId,
        taskId: data.taskId,
        userId: data.userId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
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
    });

    return this.normalizeActivityMetadata(activity);
  }

  private normalizeActivityMetadata<T extends { metadata: string | null }>(
    activity: T,
  ): Omit<T, 'metadata'> & { metadata: Record<string, any> | null } {
    return {
      ...activity,
      metadata: this.parseMetadata(activity.metadata),
    };
  }

  private parseMetadata(metadata: string | null): Record<string, any> | null {
    if (!metadata) {
      return null;
    }

    try {
      const parsed = JSON.parse(metadata);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return null;
    }

    return null;
  }
}
