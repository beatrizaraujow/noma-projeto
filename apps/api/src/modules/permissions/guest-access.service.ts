import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RolesService } from './roles.service';
import { ActionType, ResourceType } from '@nexora/types';
import * as crypto from 'crypto';

export interface CreateGuestAccessDto {
  projectId: string;
  email: string;
  canView?: boolean;
  canComment?: boolean;
  expiresAt?: Date;
}

@Injectable()
export class GuestAccessService {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService
  ) {}
  
  // Nota: Cast para any devido a cache do TS. Execute: Ctrl+Shift+P > "TypeScript: Restart TS Server"
  private get db(): any {
    return this.prisma as any;
  }

  /**
   * Criar acesso guest
   */
  async createGuestAccess(data: CreateGuestAccessDto, requestUserId: string) {
    // Verificar permissão
    const canManage = await this.rolesService.checkPermission(
      requestUserId,
      ResourceType.MEMBER,
      ActionType.MANAGE,
      undefined,
      data.projectId
    );

    if (!canManage) {
      throw new ForbiddenException('Você não tem permissão para criar acessos guest');
    }

    // Verificar se projeto existe
    const project = await this.db.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar se já existe acesso ativo para este email
    const existing = await this.db.guestAccess.findFirst({
      where: {
        projectId: data.projectId,
        email: data.email,
        revokedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (existing) {
      throw new BadRequestException('Já existe um acesso guest ativo para este email');
    }

    // Gerar token único
    const token = this.generateToken();

    // Verificar se usuário existe
    const user = await this.db.user.findUnique({
      where: { email: data.email },
    });

    return this.db.guestAccess.create({
      data: {
        projectId: data.projectId,
        email: data.email,
        userId: user?.id,
        token,
        canView: data.canView ?? true,
        canComment: data.canComment ?? false,
        expiresAt: data.expiresAt,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Listar acessos guest de um projeto
   */
  async findGuestAccesses(projectId: string, requestUserId: string) {
    const canView = await this.rolesService.checkPermission(
      requestUserId,
      ResourceType.PROJECT,
      ActionType.VIEW,
      projectId,
      projectId
    );

    if (!canView) {
      throw new ForbiddenException('Você não tem acesso a este projeto');
    }

    return this.db.guestAccess.findMany({
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
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Buscar acesso guest por token
   */
  async findByToken(token: string) {
    const access = await this.db.guestAccess.findUnique({
      where: { token },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!access) {
      throw new NotFoundException('Acesso não encontrado');
    }

    // Verificar se foi revogado
    if (access.revokedAt) {
      throw new ForbiddenException('Este acesso foi revogado');
    }

    // Verificar se expirou
    if (access.expiresAt && access.expiresAt < new Date()) {
      throw new ForbiddenException('Este acesso expirou');
    }

    // Atualizar último acesso
    await this.db.guestAccess.update({
      where: { id: access.id },
      data: { accessedAt: new Date() },
    });

    return access;
  }

  /**
   * Revogar acesso guest
   */
  async revokeGuestAccess(accessId: string, requestUserId: string) {
    const access = await this.db.guestAccess.findUnique({
      where: { id: accessId },
    });

    if (!access) {
      throw new NotFoundException('Acesso não encontrado');
    }

    const canManage = await this.rolesService.checkPermission(
      requestUserId,
      ResourceType.MEMBER,
      ActionType.MANAGE,
      undefined,
      access.projectId
    );

    if (!canManage) {
      throw new ForbiddenException('Você não tem permissão para revogar acessos');
    }

    return this.db.guestAccess.update({
      where: { id: accessId },
      data: { revokedAt: new Date() },
    });
  }

  /**
   * Validar acesso guest para uma ação
   */
  async validateGuestAccess(token: string, action: 'view' | 'comment'): Promise<boolean> {
    const access = await this.findByToken(token);

    if (action === 'view') {
      return access.canView;
    }

    if (action === 'comment') {
      return access.canComment;
    }

    return false;
  }

  /**
   * Gerar token único
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Limpar acessos expirados (pode ser chamado por cron job)
   */
  async cleanExpiredAccesses() {
    const result = await this.db.guestAccess.updateMany({
      where: {
        expiresAt: { lt: new Date() },
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return {
      message: `${result.count} acessos expirados foram revogados`,
      count: result.count,
    };
  }
}
