import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoutineDto } from './dto/create-routine.dto';

@Injectable()
export class RoutinesService {
  constructor(private prisma: PrismaService) {}

  private getCurrentPeriodKey(frequency: string): string {
    const now = new Date();
    if (frequency === 'DAILY') {
      return now.toISOString().slice(0, 10);
    }
    if (frequency === 'WEEKLY') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const week = Math.ceil(
        ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7,
      );
      return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  async findAll(workspaceId: string, userId: string) {
    const routines = await this.prisma.routine.findMany({
      where: { workspaceId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        completions: {
          where: { userId },
        },
      },
    });

    return routines.map((routine) => {
      const periodKey = this.getCurrentPeriodKey(routine.frequency);
      const completedByMe = routine.completions.some((c) => c.periodKey === periodKey);
      return { ...routine, completedByMe };
    });
  }

  async create(workspaceId: string, dto: CreateRoutineDto, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new ForbiddenException('Apenas administradores podem criar rotinas');
    }

    const maxOrder = await this.prisma.routine.findFirst({
      where: { workspaceId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return this.prisma.routine.create({
      data: {
        workspaceId,
        title: dto.title,
        description: dto.description,
        frequency: dto.frequency || 'DAILY',
        allowedRoles: dto.allowedRoles || [],
        order: dto.order ?? (maxOrder?.order ?? 0) + 1,
      },
    });
  }

  async complete(routineId: string, userId: string, periodKey: string) {
    const routine = await this.prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine) throw new NotFoundException('Rotina não encontrada');

    return this.prisma.routineCompletion.upsert({
      where: { routineId_userId_periodKey: { routineId, userId, periodKey } },
      create: { routineId, userId, periodKey },
      update: { completedAt: new Date() },
    });
  }

  async uncomplete(routineId: string, userId: string, periodKey: string) {
    return this.prisma.routineCompletion.deleteMany({
      where: { routineId, userId, periodKey },
    });
  }

  async getMetrics(workspaceId: string, period: string, startDate: string, endDate: string) {
    const routines = await this.prisma.routine.findMany({
      where: { workspaceId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        completions: {
          where: {
            completedAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });

    const memberCount = await this.prisma.workspaceMember.count({ where: { workspaceId } });

    return routines.map((routine) => {
      const uniqueUsers = new Set(routine.completions.map((c) => c.userId)).size;
      const completionRate = memberCount > 0 ? Math.round((uniqueUsers / memberCount) * 100) : 0;
      return {
        routine,
        completionRate,
        completedBy: routine.completions.map((c) => ({
          userId: c.userId,
          name: (c as any).user?.name ?? '',
          completedAt: c.completedAt,
        })),
      };
    });
  }

  async delete(routineId: string, userId: string, workspaceId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || !['OWNER', 'ADMIN'].includes(member.role)) {
      throw new ForbiddenException('Apenas administradores podem remover rotinas');
    }
    return this.prisma.routine.delete({ where: { id: routineId } });
  }
}
