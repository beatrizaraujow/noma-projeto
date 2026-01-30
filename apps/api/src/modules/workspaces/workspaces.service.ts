import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  async create(name: string, ownerId: string) {
    const slug = this.generateSlug(name);
    
    // Check if slug already exists
    const existing = await this.prisma.workspace.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException('Workspace with this name already exists');
    }

    const workspace = await this.prisma.workspace.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: ownerId,
            role: 'OWNER',
          },
        },
      },
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

    return workspace;
  }

  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
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
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
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
          orderBy: {
            createdAt: 'asc',
          },
        },
        projects: {
          take: 10,
          orderBy: {
            updatedAt: 'desc',
          },
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async update(id: string, userId: string, data: { name?: string; description?: string; logo?: string }) {
    await this.checkPermission(id, userId, ['OWNER', 'ADMIN']);

    const updateData: any = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = this.generateSlug(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.logo !== undefined) updateData.logo = data.logo;

    return this.prisma.workspace.update({
      where: { id },
      data: updateData,
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
  }

  async delete(id: string, userId: string) {
    await this.checkPermission(id, userId, ['OWNER']);

    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  async updateMemberRole(workspaceId: string, requesterId: string, memberId: string, role: string) {
    await this.checkPermission(workspaceId, requesterId, ['OWNER', 'ADMIN']);

    // Cannot change owner role
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: memberId,
      },
    });

    if (member?.role === 'OWNER') {
      throw new ForbiddenException('Cannot change owner role');
    }

    return this.prisma.workspaceMember.update({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
      data: { role },
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
  }

  async removeMember(workspaceId: string, requesterId: string, memberId: string) {
    await this.checkPermission(workspaceId, requesterId, ['OWNER', 'ADMIN']);

    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: memberId,
      },
    });

    if (member?.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove workspace owner');
    }

    return this.prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberId,
        },
      },
    });
  }

  async getMemberRole(workspaceId: string, userId: string): Promise<string | null> {
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    return member?.role || null;
  }

  private async checkPermission(workspaceId: string, userId: string, allowedRoles: string[]) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Math.random().toString(36).substring(2, 7);
  }
}
