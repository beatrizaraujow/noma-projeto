import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private workspacesService: WorkspacesService,
  ) {}

  async create(
    workspaceId: string,
    data: { name: string; description?: string; color?: string; icon?: string },
    userId: string,
  ) {
    // Verify user is member of workspace
    await this.verifyWorkspaceMember(workspaceId, userId);

    return this.prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        icon: data.icon,
        workspaceId,
        ownerId: userId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });
  }

  async findAll(workspaceId: string, userId: string) {
    // Verify user is member of workspace
    await this.verifyWorkspaceMember(workspaceId, userId);

    return this.prisma.project.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        workspace: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            position: 'asc',
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Verify user is member of workspace
    await this.verifyWorkspaceMember(project.workspaceId, userId);

    return project;
  }

  async update(
    id: string,
    data: { name?: string; description?: string; color?: string; icon?: string },
    userId: string,
  ) {
    const project = await this.findOne(id, userId);

    // Only owner or workspace admin can update
    const role = await this.workspacesService.getMemberRole(project.workspaceId, userId);
    if (project.ownerId !== userId && !['OWNER', 'ADMIN'].includes(role || '')) {
      throw new ForbiddenException('Only project owner or workspace admin can update');
    }

    return this.prisma.project.update({
      where: { id },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        members: {
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

  async remove(id: string, userId: string) {
    const project = await this.findOne(id, userId);

    // Only owner or workspace owner can delete
    const role = await this.workspacesService.getMemberRole(project.workspaceId, userId);
    if (project.ownerId !== userId && role !== 'OWNER') {
      throw new ForbiddenException('Only project owner or workspace owner can delete');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async addMember(projectId: string, memberId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

    // Verify member is in workspace
    await this.verifyWorkspaceMember(project.workspaceId, memberId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          connect: { id: memberId },
        },
      },
      include: {
        members: {
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

  async removeMember(projectId: string, memberId: string, userId: string) {
    const project = await this.findOne(projectId, userId);

    if (project.ownerId === memberId) {
      throw new ForbiddenException('Cannot remove project owner');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        members: {
          disconnect: { id: memberId },
        },
      },
      include: {
        members: {
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

  private async verifyWorkspaceMember(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }
  }
}
