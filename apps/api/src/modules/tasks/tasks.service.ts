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

    const ATIVO = ['EM_PROGRESSO', 'ALTERAR'];
    const FEITO = ['APROVAR', 'REVISAO_IA', 'APROVACAO_LIDER', 'PUBLICAR', 'BANCO_CRIATIVOS', 'REVISAO_SOLICITADA'];
    const FECHADO = ['COMPLETO'];
    const groupOf = (status: string): 'ATIVO' | 'FEITO' | 'FECHADO' =>
      FECHADO.includes(status) ? 'FECHADO' : FEITO.includes(status) ? 'FEITO' : 'ATIVO';

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const sixWeeksAgo = new Date(now);
    sixWeeksAgo.setDate(now.getDate() - 42);
    const where = { projectId: { in: projectIds } };

    // Agrega no banco (em paralelo) em vez de carregar todas as tarefas em memória.
    const [
      byStatusRows,
      byPriorityRows,
      byProjectStatusRows,
      byMemberStatusRows,
      overdueRows,
      hoursRows,
      completedRecent,
    ] = await Promise.all([
      this.prisma.task.groupBy({ by: ['status'], where, _count: { _all: true } }),
      this.prisma.task.groupBy({ by: ['priority'], where, _count: { _all: true } }),
      this.prisma.task.groupBy({ by: ['projectId', 'status'], where, _count: { _all: true } }),
      this.prisma.task.groupBy({
        by: ['assigneeId', 'status'],
        where: { ...where, assigneeId: { not: null } },
        _count: { _all: true },
      }),
      this.prisma.task.groupBy({
        by: ['assigneeId'],
        where: { ...where, status: { in: ATIVO }, dueDate: { lt: now } },
        _count: { _all: true },
      }),
      this.prisma.timeEntry.groupBy({
        by: ['userId'],
        where: { task: { projectId: { in: projectIds } }, date: { gte: startOfMonth } },
        _sum: { hours: true },
      }),
      this.prisma.task.findMany({
        where: { ...where, status: { in: FECHADO }, updatedAt: { gt: sixWeeksAgo } },
        select: { updatedAt: true },
      }),
    ]);

    // byStatus + byGroup
    const byStatus: Record<string, number> = {};
    const byGroup: Record<string, number> = { ATIVO: 0, FEITO: 0, FECHADO: 0 };
    for (const r of byStatusRows) {
      byStatus[r.status] = r._count._all;
      byGroup[groupOf(r.status)] += r._count._all;
    }

    // byPriority
    const byPriority: Record<string, number> = {};
    for (const r of byPriorityRows) byPriority[r.priority] = r._count._all;

    // byProject (inclui projetos com 0 tarefas)
    const projectMap = new Map<string, { projectId: string; name: string; active: number; feito: number; fechado: number }>();
    projects.forEach((p) => projectMap.set(p.id, { projectId: p.id, name: p.name, active: 0, feito: 0, fechado: 0 }));
    for (const r of byProjectStatusRows) {
      const proj = projectMap.get(r.projectId);
      if (!proj) continue;
      const g = groupOf(r.status);
      if (g === 'ATIVO') proj.active += r._count._all;
      else if (g === 'FEITO') proj.feito += r._count._all;
      else proj.fechado += r._count._all;
    }

    // overdue (total + por membro)
    let overdueCount = 0;
    const overdueByMember = new Map<string, number>();
    for (const r of overdueRows) {
      overdueCount += r._count._all;
      if (r.assigneeId) overdueByMember.set(r.assigneeId, r._count._all);
    }

    // horas do mês (total + por membro)
    let hoursThisMonth = 0;
    const hoursByMember = new Map<string, number>();
    for (const r of hoursRows) {
      const h = r._sum.hours ?? 0;
      hoursThisMonth += h;
      hoursByMember.set(r.userId, h);
    }

    // byMember: acumula por responsável
    const memberMap = new Map<string, { userId: string; active: number; feito: number; fechado: number }>();
    for (const r of byMemberStatusRows) {
      const id = r.assigneeId;
      if (!id) continue;
      if (!memberMap.has(id)) memberMap.set(id, { userId: id, active: 0, feito: 0, fechado: 0 });
      const m = memberMap.get(id)!;
      const g = groupOf(r.status);
      if (g === 'ATIVO') m.active += r._count._all;
      else if (g === 'FEITO') m.feito += r._count._all;
      else m.fechado += r._count._all;
    }

    // nome/avatar dos responsáveis (uma query só)
    const memberIds = Array.from(memberMap.keys());
    const users = memberIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: memberIds } },
          select: { id: true, name: true, avatar: true },
        })
      : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    const byMember = Array.from(memberMap.values())
      .map((m) => ({
        userId: m.userId,
        name: userById.get(m.userId)?.name ?? '',
        avatar: userById.get(m.userId)?.avatar ?? null,
        active: m.active,
        feito: m.feito,
        fechado: m.fechado,
        overdue: overdueByMember.get(m.userId) ?? 0,
        hoursThisMonth: hoursByMember.get(m.userId) ?? 0,
      }))
      .sort((a, b) => (b.fechado + b.feito) - (a.fechado + a.feito));

    const byProject = Array.from(projectMap.values())
      .sort((a, b) => (b.active + b.feito + b.fechado) - (a.active + a.feito + a.fechado));

    // weeklyThroughput: só tarefas concluídas nas últimas 6 semanas
    const weeklyMap = new Map<string, number>();
    for (const t of completedRecent) {
      const key = this.getWeekKey(new Date(t.updatedAt));
      weeklyMap.set(key, (weeklyMap.get(key) ?? 0) + 1);
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
      byMember,
      byProject,
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
