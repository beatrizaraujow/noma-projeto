import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomRoleDto, UpdateCustomRoleDto } from './dto/permissions.dto';
import { ResourceType, ActionType, PermissionScope } from '@nexora/types';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Criar role customizado
   */
  async createCustomRole(data: CreateCustomRoleDto, userId: string) {
    // Verificar se já existe role com esse nome
    const existing = await this.prisma.customRole.findFirst({
      where: {
        name: data.name,
        workspaceId: data.workspaceId || null,
      },
    });

    if (existing) {
      throw new BadRequestException('Role com esse nome já existe');
    }

    return this.prisma.customRole.create({
      data: {
        name: data.name,
        description: data.description,
        workspaceId: data.workspaceId,
        isSystem: false,
        createdById: userId,
        permissions: {
          create: data.permissions.map((perm) => ({
            resource: perm.resource,
            action: perm.action,
            scope: perm.scope || PermissionScope.ALL,
            conditions: perm.conditions,
          })),
        },
      },
      include: {
        permissions: true,
        createdBy: {
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
   * Listar roles customizados
   */
  async findAllCustomRoles(workspaceId?: string) {
    return this.prisma.customRole.findMany({
      where: {
        OR: [
          { workspaceId },
          { isSystem: true }, // Include system roles
        ],
      },
      include: {
        permissions: true,
        _count: {
          select: {
            projectMembers: true,
            workspaceMembers: true,
          },
        },
      },
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Buscar role por ID
   */
  async findCustomRole(id: string) {
    const role = await this.prisma.customRole.findUnique({
      where: { id },
      include: {
        permissions: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrado');
    }

    return role;
  }

  /**
   * Atualizar role customizado
   */
  async updateCustomRole(id: string, data: UpdateCustomRoleDto, userId: string) {
    const role = await this.prisma.customRole.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrado');
    }

    if (role.isSystem) {
      throw new ForbiddenException('Não é possível editar roles do sistema');
    }

    // Se estiver atualizando permissões, deletar as antigas e criar novas
    if (data.permissions) {
      await this.prisma.permission.deleteMany({
        where: { roleId: id },
      });
    }

    return this.prisma.customRole.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ...(data.permissions && {
          permissions: {
            create: data.permissions.map((perm) => ({
              resource: perm.resource,
              action: perm.action,
              scope: perm.scope || PermissionScope.ALL,
              conditions: perm.conditions,
            })),
          },
        }),
      },
      include: {
        permissions: true,
      },
    });
  }

  /**
   * Deletar role customizado
   */
  async deleteCustomRole(id: string) {
    const role = await this.prisma.customRole.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            projectMembers: true,
            workspaceMembers: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role não encontrado');
    }

    if (role.isSystem) {
      throw new ForbiddenException('Não é possível deletar roles do sistema');
    }

    const membersCount = role._count.projectMembers + role._count.workspaceMembers;
    if (membersCount > 0) {
      throw new BadRequestException(
        `Não é possível deletar role em uso por ${membersCount} membro(s)`
      );
    }

    await this.prisma.customRole.delete({
      where: { id },
    });

    return { message: 'Role deletado com sucesso' };
  }

  /**
   * Verificar se usuário tem permissão específica
   */
  async checkPermission(
    userId: string,
    resource: ResourceType,
    action: ActionType,
    resourceId?: string,
    projectId?: string
  ): Promise<boolean> {
    // Super admin sempre tem permissão
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role === 'ADMIN') {
      return true;
    }

    // Verificar permissões de projeto
    if (projectId) {
      const projectMember = await this.prisma.projectMember.findFirst({
        where: {
          projectId,
          userId,
        },
        include: {
          customRole: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!projectMember) {
        return false;
      }

      // Verificar permissões baseadas em role
      if (projectMember.role === 'OWNER') {
        return true;
      }

      // Verificar permissões granulares
      if (action === ActionType.VIEW && projectMember.canView) {
        return true;
      }
      if (action === ActionType.EDIT && projectMember.canEdit) {
        return true;
      }
      if (action === ActionType.DELETE && projectMember.canDelete) {
        return true;
      }
      if (action === ActionType.MANAGE && projectMember.canManage) {
        return true;
      }

      // Verificar custom role permissions
      if (projectMember.customRole) {
        const hasPermission = projectMember.customRole.permissions.some(
          (perm) =>
            perm.resource === resource &&
            (perm.action === action || perm.action === ActionType.MANAGE)
        );

        if (hasPermission) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Inicializar roles do sistema (seed)
   */
  async initializeSystemRoles() {
    const systemRoles = [
      {
        name: 'Owner',
        description: 'Controle total sobre o projeto',
        isSystem: true,
        permissions: [
          { resource: ResourceType.PROJECT, action: ActionType.MANAGE, scope: PermissionScope.ALL },
          { resource: ResourceType.TASK, action: ActionType.MANAGE, scope: PermissionScope.ALL },
          { resource: ResourceType.COMMENT, action: ActionType.MANAGE, scope: PermissionScope.ALL },
          { resource: ResourceType.MEMBER, action: ActionType.MANAGE, scope: PermissionScope.ALL },
        ],
      },
      {
        name: 'Admin',
        description: 'Pode gerenciar a maior parte do projeto',
        isSystem: true,
        permissions: [
          { resource: ResourceType.PROJECT, action: ActionType.EDIT, scope: PermissionScope.ALL },
          { resource: ResourceType.TASK, action: ActionType.MANAGE, scope: PermissionScope.ALL },
          { resource: ResourceType.COMMENT, action: ActionType.MANAGE, scope: PermissionScope.ALL },
          { resource: ResourceType.MEMBER, action: ActionType.EDIT, scope: PermissionScope.ALL },
        ],
      },
      {
        name: 'Member',
        description: 'Pode criar e editar conteúdo atribuído',
        isSystem: true,
        permissions: [
          { resource: ResourceType.PROJECT, action: ActionType.VIEW, scope: PermissionScope.ALL },
          { resource: ResourceType.TASK, action: ActionType.CREATE, scope: PermissionScope.ALL },
          { resource: ResourceType.TASK, action: ActionType.EDIT, scope: PermissionScope.ASSIGNED },
          { resource: ResourceType.COMMENT, action: ActionType.CREATE, scope: PermissionScope.ALL },
          { resource: ResourceType.COMMENT, action: ActionType.EDIT, scope: PermissionScope.OWN },
        ],
      },
      {
        name: 'Viewer',
        description: 'Acesso apenas de leitura',
        isSystem: true,
        permissions: [
          { resource: ResourceType.PROJECT, action: ActionType.VIEW, scope: PermissionScope.ALL },
          { resource: ResourceType.TASK, action: ActionType.VIEW, scope: PermissionScope.ALL },
          { resource: ResourceType.COMMENT, action: ActionType.VIEW, scope: PermissionScope.ALL },
        ],
      },
    ];

    // Criar primeiro usuário admin se não existir
    let adminUser = await this.prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (!adminUser) {
      // Criar usuário temporário para roles do sistema
      adminUser = await this.prisma.user.create({
        data: {
          email: 'system@numa.local',
          password: 'system',
          name: 'System',
          role: 'ADMIN',
        },
      });
    }

    for (const roleData of systemRoles) {
      const existing = await this.prisma.customRole.findFirst({
        where: {
          name: roleData.name,
          isSystem: true,
        },
      });

      if (!existing) {
        await this.prisma.customRole.create({
          data: {
            name: roleData.name,
            description: roleData.description,
            isSystem: roleData.isSystem,
            createdById: adminUser.id,
            permissions: {
              create: roleData.permissions,
            },
          },
        });
      }
    }

    return { message: 'System roles initialized' };
  }
}
