import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectMemberDto, UpdateProjectMemberDto } from './dto/permissions.dto';
import { RolesService } from './roles.service';
import { ActionType, ResourceType } from '@nexora/types';

@Injectable()
export class ProjectMembersService {
  constructor(
    private prisma: PrismaService,
    private rolesService: RolesService
  ) {}
  
  // Nota: Cast para any devido a cache do TS. Execute: Ctrl+Shift+P > "TypeScript: Restart TS Server"
  private get db(): any {
    return this.prisma as any;
  }

  /**
   * Adicionar membro ao projeto
   */
  async addProjectMember(projectId: string, data: CreateProjectMemberDto, requestUserId: string) {
    // Verificar se requisitante tem permissão
    const canManage = await this.rolesService.checkPermission(
      requestUserId,
      ResourceType.MEMBER,
      ActionType.MANAGE,
      undefined,
      projectId
    );

    if (!canManage) {
      throw new ForbiddenException('Você não tem permissão para adicionar membros');
    }

    // Verificar se usuário existe
    const user = await this.db.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já é membro
    const existing = await this.db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Usuário já é membro do projeto');
    }

    // Definir permissões baseadas no role
    const permissions = this.getPermissionsByRole(data.role || 'MEMBER');

    return this.db.projectMember.create({
      data: {
        projectId,
        userId: data.userId,
        role: data.role || 'MEMBER',
        roleId: data.roleId,
        canView: data.canView ?? permissions.canView,
        canEdit: data.canEdit ?? permissions.canEdit,
        canDelete: data.canDelete ?? permissions.canDelete,
        canManage: data.canManage ?? permissions.canManage,
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
        customRole: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  /**
   * Listar membros do projeto
   */
  async findProjectMembers(projectId: string, userId: string) {
    // Verificar acesso
    const canView = await this.rolesService.checkPermission(
      userId,
      ResourceType.PROJECT,
      ActionType.VIEW,
      projectId,
      projectId
    );

    if (!canView) {
      throw new ForbiddenException('Você não tem acesso a este projeto');
    }

    return this.db.projectMember.findMany({
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
        customRole: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Atualizar permissões de membro
   */
  async updateProjectMember(
    projectId: string,
    memberId: string,
    data: UpdateProjectMemberDto,
    requestUserId: string
  ) {
    // Verificar permissão
    const canManage = await this.rolesService.checkPermission(
      requestUserId,
      ResourceType.MEMBER,
      ActionType.MANAGE,
      undefined,
      projectId
    );

    if (!canManage) {
      throw new ForbiddenException('Você não tem permissão para editar membros');
    }

    const member = await this.db.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    // Não permitir editar owner do projeto
    if (member.role === 'OWNER' && data.role && data.role !== 'OWNER') {
      throw new ForbiddenException('Não é possível alterar role do owner');
    }

    return this.db.projectMember.update({
      where: { id: memberId },
      data: {
        role: data.role,
        roleId: data.roleId,
        canView: data.canView,
        canEdit: data.canEdit,
        canDelete: data.canDelete,
        canManage: data.canManage,
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
        customRole: {
          include: {
            permissions: true,
          },
        },
      },
    });
  }

  /**
   * Remover membro do projeto
   */
  async removeProjectMember(projectId: string, memberId: string, requestUserId: string) {
    const canManage = await this.rolesService.checkPermission(
      requestUserId,
      ResourceType.MEMBER,
      ActionType.MANAGE,
      undefined,
      projectId
    );

    if (!canManage) {
      throw new ForbiddenException('Você não tem permissão para remover membros');
    }

    const member = await this.db.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (member.role === 'OWNER') {
      throw new ForbiddenException('Não é possível remover o owner do projeto');
    }

    await this.db.projectMember.delete({
      where: { id: memberId },
    });

    return { message: 'Membro removido com sucesso' };
  }

  /**
   * Verificar permissões de um membro
   */
  async getMemberPermissions(projectId: string, userId: string) {
    const member = await this.db.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        customRole: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!member) {
      return null;
    }

    return {
      role: member.role,
      canView: member.canView,
      canEdit: member.canEdit,
      canDelete: member.canDelete,
      canManage: member.canManage,
      customRole: member.customRole,
    };
  }

  /**
   * Obter permissões padrão por role
   */
  private getPermissionsByRole(role: string) {
    const permissions = {
      OWNER: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManage: true,
      },
      ADMIN: {
        canView: true,
        canEdit: true,
        canDelete: true,
        canManage: false,
      },
      MEMBER: {
        canView: true,
        canEdit: true,
        canDelete: false,
        canManage: false,
      },
      VIEWER: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManage: false,
      },
      GUEST: {
        canView: true,
        canEdit: false,
        canDelete: false,
        canManage: false,
      },
    };

    return permissions[role] || permissions.MEMBER;
  }
}
