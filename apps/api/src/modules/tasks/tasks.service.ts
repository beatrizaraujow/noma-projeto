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
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
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

  async createTimeEntry(
    taskId: string,
    dto: { hours: number; description?: string; date?: string },
    userId: string,
  ) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.verifyProjectAccess(task.projectId, userId);

    const entry = await this.prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        hours: dto.hours,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    await this.prisma.task.update({
      where: { id: taskId },
      data: { actualHours: { increment: dto.hours } },
    });

    return entry;
  }

  async getTimeEntries(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');
    await this.verifyProjectAccess(task.projectId, userId);

    return this.prisma.timeEntry.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getTimeReport(
    filters: { projectId?: string; userId?: string; start?: string; end?: string },
    requestingUserId: string,
  ) {
    const where: any = {};
    if (filters.projectId) {
      await this.verifyProjectAccess(filters.projectId, requestingUserId);
      where.task = { projectId: filters.projectId };
    }
    if (filters.userId) where.userId = filters.userId;
    if (filters.start || filters.end) {
      where.date = {};
      if (filters.start) where.date.gte = new Date(filters.start);
      if (filters.end) where.date.lte = new Date(filters.end);
    }

    const entries = await this.prisma.timeEntry.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        task: { select: { id: true, title: true, projectId: true } },
      },
      orderBy: { date: 'desc' },
    });

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    return { entries, totalHours };
  }

  async findByWorkspace(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    return this.prisma.task.findMany({
      where: { project: { workspaceId } },
      select: {
        id: true, title: true, description: true, status: true,
        priority: true, dueDate: true, estimatedHours: true,
        actualHours: true, projectId: true, position: true,
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ status: 'asc' }, { position: 'asc' }],
    });
  }

  async getDeliveryStats(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });
    if (!member) throw new ForbiddenException('Not a workspace member');

    const projects = await this.prisma.project.findMany({
      where: { workspaceId },
      select: { id: true, name: true },
    });
    const projectIds = projects.map((p) => p.id);

    if (projectIds.length === 0) {
      return {
        byGroup: { ATIVO: 0, FEITO: 0, FECHADO: 0 },
        byStatus: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        overdueCount: 0,
        hoursThisMonth: 0,
        byMember: [] as any[],
        byProject: [] as any[],
        weeklyThroughput: [] as any[],
      };
    }

    const tasks = await this.prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      select: {
        id: true, status: true, priority: true, dueDate: true,
        projectId: true, assigneeId: true, updatedAt: true,
        assignee: { select: { id: true, name: true, avatar: true } },
      },
    });

    const ATIVO = new Set(['EM_PROGRESSO', 'ALTERAR']);
    const FEITO = new Set(['APROVAR', 'REVISAO_IA', 'APROVACAO_LIDER', 'PUBLICAR', 'BANCO_CRIATIVOS', 'REVISAO_SOLICITADA']);
    const FECHADO = new Set(['COMPLETO']);

    const now = new Date();
    const byGroup: Record<string, number> = { ATIVO: 0, FEITO: 0, FECHADO: 0 };
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let overdueCount = 0;

    const memberMap = new Map<string, { userId: string; name: string; avatar: string | null; active: number; feito: number; fechado: number; overdue: number }>();
    const projectMap = new Map<string, { projectId: string; name: string; active: number; feito: number; fechado: number }>();
    projects.forEach((p) => projectMap.set(p.id, { projectId: p.id, name: p.name, active: 0, feito: 0, fechado: 0 }));

    for (const task of tasks) {
      let group: 'ATIVO' | 'FEITO' | 'FECHADO' = 'ATIVO';
      if (FEITO.has(task.status)) group = 'FEITO';
      else if (FECHADO.has(task.status)) group = 'FECHADO';

      byGroup[group]++;
      byStatus[task.status] = (byStatus[task.status] ?? 0) + 1;
      byPriority[task.priority] = (byPriority[task.priority] ?? 0) + 1;

      const isOverdue = group === 'ATIVO' && task.dueDate && new Date(task.dueDate) < now;
      if (isOverdue) overdueCount++;

      if (task.assignee && task.assigneeId) {
        if (!memberMap.has(task.assigneeId)) {
          memberMap.set(task.assigneeId, { userId: task.assigneeId, name: task.assignee.name, avatar: task.assignee.avatar ?? null, active: 0, feito: 0, fechado: 0, overdue: 0 });
        }
        const m = memberMap.get(task.assigneeId)!;
        if (group === 'ATIVO') { m.active++; if (isOverdue) m.overdue++; }
        else if (group === 'FEITO') m.feito++;
        else m.fechado++;
      }

      const proj = projectMap.get(task.projectId);
      if (proj) {
        if (group === 'ATIVO') proj.active++;
        else if (group === 'FEITO') proj.feito++;
        else proj.fechado++;
      }
    }

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const entries = await this.prisma.timeEntry.findMany({
      where: { task: { projectId: { in: projectIds } }, date: { gte: startOfMonth } },
      select: { hours: true, userId: true },
    });
    const hoursThisMonth = entries.reduce((sum, e) => sum + e.hours, 0);
    const hoursByMember = new Map<string, number>();
    entries.forEach((e) => hoursByMember.set(e.userId, (hoursByMember.get(e.userId) ?? 0) + e.hours));

    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(now.getDate() - 42);
    const weeklyMap = new Map<string, number>();
    for (const task of tasks) {
      if (FECHADO.has(task.status) && task.updatedAt > sixWeeksAgo) {
        const key = this.getWeekKey(new Date(task.updatedAt));
        weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + 1);
      }
    }
    const weeklyThroughput: { week: string; label: string; completed: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i * 7);
      const key = this.getWeekKey(d);
      const wkNum = key.split('-W')[1];
      weeklyThroughput.push({ week: key, label: `S${wkNum}`, completed: weeklyMap.get(key) ?? 0 });
    }

    return {
      byGroup,
      byStatus,
      byPriority,
      overdueCount,
      hoursThisMonth,
      byMember: Array.from(memberMap.values()).map((m) => ({ ...m, hoursThisMonth: hoursByMember.get(m.userId) ?? 0 })).sort((a, b) => (b.fechado + b.feito) - (a.fechado + a.feito)),
      byProject: Array.from(projectMap.values()).sort((a, b) => (b.active + b.feito + b.fechado) - (a.active + a.feito + a.fechado)),
      weeklyThroughput,
    };
  }

  private getWeekKey(date: Date): string {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
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
