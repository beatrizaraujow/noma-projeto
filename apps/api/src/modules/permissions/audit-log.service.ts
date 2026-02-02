import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditAction, ResourceType } from '@nexora/types';

export interface CreateAuditLogDto {
  userId: string;
  action: AuditAction | string;
  resource: ResourceType | string;
  resourceId?: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar log de auditoria
   */
  async log(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        description: data.description,
        metadata: data.metadata,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * Buscar logs com filtros
   */
  async findLogs(filters: AuditLogFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.resource) {
      where.resource = filters.resource;
    }

    if (filters.resourceId) {
      where.resourceId = filters.resourceId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Buscar logs de um projeto específico
   */
  async findProjectLogs(projectId: string, page = 1, limit = 50) {
    return this.findLogs({
      resource: ResourceType.PROJECT,
      resourceId: projectId,
      page,
      limit,
    });
  }

  /**
   * Buscar logs de um usuário específico
   */
  async findUserLogs(userId: string, page = 1, limit = 50) {
    return this.findLogs({
      userId,
      page,
      limit,
    });
  }

  /**
   * Estatísticas de auditoria
   */
  async getStats(startDate?: Date, endDate?: Date) {
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [
      totalLogs,
      logsByAction,
      logsByResource,
      logsByUser,
      recentLogs,
    ] = await Promise.all([
      // Total de logs
      this.prisma.auditLog.count({ where }),

      // Logs por ação
      this.prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),

      // Logs por recurso
      this.prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { resource: true },
        orderBy: { _count: { resource: 'desc' } },
      }),

      // Usuários mais ativos
      this.prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),

      // Logs recentes
      this.prisma.auditLog.findMany({
        where,
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalLogs,
      logsByAction: logsByAction.map((item) => ({
        action: item.action,
        count: item._count.action,
      })),
      logsByResource: logsByResource.map((item) => ({
        resource: item.resource,
        count: item._count.resource,
      })),
      topUsers: logsByUser.map((item) => ({
        userId: item.userId,
        count: item._count.userId,
      })),
      recentLogs,
    };
  }

  /**
   * Limpar logs antigos (pode ser chamado por cron job)
   */
  async cleanOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });

    return {
      message: `${result.count} logs antigos foram removidos`,
      count: result.count,
    };
  }

  /**
   * Helper: Log de autenticação
   */
  async logAuth(userId: string, action: 'login' | 'logout' | 'login_failed', ipAddress?: string, userAgent?: string) {
    return this.log({
      userId,
      action,
      resource: 'auth',
      description: `Usuário ${action === 'login' ? 'entrou' : action === 'logout' ? 'saiu' : 'tentou entrar sem sucesso'}`,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper: Log de criação
   */
  async logCreate(userId: string, resource: ResourceType | string, resourceId: string, description: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.CREATE,
      resource,
      resourceId,
      description,
      metadata,
    });
  }

  /**
   * Helper: Log de atualização
   */
  async logUpdate(userId: string, resource: ResourceType | string, resourceId: string, description: string, metadata?: any) {
    return this.log({
      userId,
      action: AuditAction.UPDATE,
      resource,
      resourceId,
      description,
      metadata,
    });
  }

  /**
   * Helper: Log de deleção
   */
  async logDelete(userId: string, resource: ResourceType | string, resourceId: string, description: string) {
    return this.log({
      userId,
      action: AuditAction.DELETE,
      resource,
      resourceId,
      description,
    });
  }

  /**
   * Helper: Log de permissão
   */
  async logPermission(userId: string, action: string, targetUserId: string, projectId: string, description: string) {
    return this.log({
      userId,
      action,
      resource: ResourceType.MEMBER,
      resourceId: projectId,
      description,
      metadata: {
        targetUserId,
        projectId,
      },
    });
  }
}
