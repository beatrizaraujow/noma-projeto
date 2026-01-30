import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SearchDto, SearchEntityType } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(searchDto: SearchDto, userId: string) {
    const { query, entityType, workspaceId, limit, offset } = searchDto;

    // Build search term for PostgreSQL full-text search
    const searchTerm = query.trim().split(' ').join(' & ');

    const results: any = {
      tasks: [],
      projects: [],
      comments: [],
    };

    // Get user's accessible workspace IDs
    const userWorkspaces = await this.prisma.workspaceMember.findMany({
      where: { userId },
      select: { workspaceId: true },
    });
    const workspaceIds = userWorkspaces.map((w) => w.workspaceId);

    // Filter by specific workspace if provided
    const targetWorkspaceIds = workspaceId ? [workspaceId] : workspaceIds;

    if (entityType === SearchEntityType.ALL || entityType === SearchEntityType.TASK) {
      results.tasks = await this.searchTasks(query, targetWorkspaceIds, limit, offset);
    }

    if (entityType === SearchEntityType.ALL || entityType === SearchEntityType.PROJECT) {
      results.projects = await this.searchProjects(query, targetWorkspaceIds, limit, offset);
    }

    if (entityType === SearchEntityType.ALL || entityType === SearchEntityType.COMMENT) {
      results.comments = await this.searchComments(query, targetWorkspaceIds, limit, offset);
    }

    return results;
  }

  private async searchTasks(query: string, workspaceIds: string[], limit: number, offset: number) {
    const tasks = await this.prisma.task.findMany({
      where: {
        project: {
          workspaceId: { in: workspaceIds },
        },
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
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
      take: limit,
      skip: offset,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return tasks;
  }

  private async searchProjects(query: string, workspaceIds: string[], limit: number, offset: number) {
    const projects = await this.prisma.project.findMany({
      where: {
        workspaceId: { in: workspaceIds },
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
            members: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return projects;
  }

  private async searchComments(query: string, workspaceIds: string[], limit: number, offset: number) {
    const comments = await this.prisma.comment.findMany({
      where: {
        task: {
          project: {
            workspaceId: { in: workspaceIds },
          },
        },
        content: { contains: query, mode: 'insensitive' },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            projectId: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments;
  }
}
