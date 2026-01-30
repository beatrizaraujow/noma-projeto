import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { TaskFilterDto } from './dto/task-filter.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(
    data: {
      title: string;
      description?: string;
      projectId: string;
      assigneeId?: string;
      priority?: string;
      status?: string;
      dueDate?: Date;
    },
    userId: string,
  ) {
    // Verify user has access to project
    await this.verifyProjectAccess(data.projectId, userId);

    // Get max position for new task
    const maxPosition = await this.prisma.task.findFirst({
      where: { projectId: data.projectId, status: data.status || 'TODO' },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assigneeId: data.assigneeId,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'TODO',
        dueDate: data.dueDate,
        position: (maxPosition?.position || 0) + 1,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    }).then((task) => {
      // Broadcast task created
      this.websocketGateway.broadcastTaskCreated(data.projectId, task);
      
      // Send notification to assignee if assigned
      if (data.assigneeId && data.assigneeId !== userId) {
        this.websocketGateway.sendNotification(data.assigneeId, {
          type: 'task_assigned',
          title: 'Nova tarefa atribuída',
          message: `Você foi atribuído à tarefa: ${task.title}`,
          projectId: data.projectId,
          taskId: task.id,
          userId: data.assigneeId,
        });
      }
      
      return task;
    });
  }

  async findAll(projectId: string, userId: string, page: number = 1, limit: number = 50) {
    // Verify user has access to project
    await this.verifyProjectAccess(projectId, userId);

    const skip = (page - 1) * limit;

    return this.prisma.task.findMany({
      where: { projectId },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        position: true,
        createdAt: true,
        updatedAt: true,
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });
  }

  async findWithFilters(filters: TaskFilterDto, userId: string) {
    // If projectId is provided, verify access
    if (filters.projectId) {
      await this.verifyProjectAccess(filters.projectId, userId);
    }

    // Build where clause
    const where: any = {};

    if (filters.projectId) {
      where.projectId = filters.projectId;
    } else {
      // Get all accessible projects for the user
      const userWorkspaces = await this.prisma.workspaceMember.findMany({
        where: { userId },
        select: { workspaceId: true },
      });
      const workspaceIds = userWorkspaces.map((w) => w.workspaceId);
      
      where.project = {
        workspaceId: { in: workspaceIds },
      };
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters.assigneeIds && filters.assigneeIds.length > 0) {
      where.assigneeId = { in: filters.assigneeIds };
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.updatedAt = 'desc';
    }

    return this.prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy,
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            workspace: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
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
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify user has access
    await this.verifyProjectAccess(task.projectId, userId);

    return task;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      assigneeId?: string;
      priority?: string;
      status?: string;
      dueDate?: Date;
      position?: number;
    },
    userId: string,
  ) {
    const task = await this.findOne(id, userId);
    const oldStatus = task.status;
    const oldAssigneeId = task.assigneeId;

    // If status changed, update position
    if (data.status && data.status !== task.status && data.position === undefined) {
      const maxPosition = await this.prisma.task.findFirst({
        where: { projectId: task.projectId, status: data.status },
        orderBy: { position: 'desc' },
        select: { position: true },
      });
      data.position = (maxPosition?.position || 0) + 1;
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    }).then((updatedTask) => {
      // Broadcast task updated
      this.websocketGateway.broadcastTaskUpdated(task.projectId, updatedTask);
      
      // Broadcast status change if changed
      if (data.status && data.status !== oldStatus) {
        this.websocketGateway.broadcastTaskStatusChange(
          task.projectId,
          id,
          data.status,
          userId,
        );
      }
      
      // Broadcast assignment if changed
      if (data.assigneeId && data.assigneeId !== oldAssigneeId) {
        this.websocketGateway.broadcastTaskAssignment(
          task.projectId,
          id,
          data.assigneeId,
          userId,
        );
        
        // Send notification to new assignee
        if (data.assigneeId !== userId) {
          this.websocketGateway.sendNotification(data.assigneeId, {
            type: 'task_assigned',
            title: 'Tarefa atribuída',
            message: `Você foi atribuído à tarefa: ${updatedTask.title}`,
            projectId: task.projectId,
            taskId: id,
            userId: data.assigneeId,
          });
        }
      }
      
      // Send notification if task was updated (but not by assignee)
      if (oldAssigneeId && oldAssigneeId !== userId && !data.assigneeId) {
        this.websocketGateway.sendNotification(oldAssigneeId, {
          type: 'task_updated',
          title: 'Tarefa atualizada',
          message: `A tarefa "${updatedTask.title}" foi atualizada`,
          projectId: task.projectId,
          taskId: id,
          userId: oldAssigneeId,
        });
      }
      
      return updatedTask;
    });
  }

  async remove(id: string, userId: string) {
    const task = await this.findOne(id, userId);

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async updatePositions(
    projectId: string,
    updates: { id: string; position: number; status?: string }[],
    userId: string,
  ) {
    await this.verifyProjectAccess(projectId, userId);

    const updatePromises = updates.map((update) =>
      this.prisma.task.update({
        where: { id: update.id },
        data: {
          position: update.position,
          ...(update.status && { status: update.status }),
        },
      })
    );

    return Promise.all(updatePromises);
  }

  private async verifyProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.workspace.members.length === 0) {
      throw new ForbiddenException('You do not have access to this project');
    }
  }
}
