import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSavedFilterDto, UpdateSavedFilterDto } from './dto/saved-filter.dto';

@Injectable()
export class SavedFiltersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSavedFilterDto, userId: string) {
    return this.prisma.savedFilter.create({
      data: {
        name: data.name,
        description: data.description,
        entityType: data.entityType,
        filters: JSON.stringify(data.filters),
        userId,
        workspaceId: data.workspaceId,
        isPublic: data.isPublic || false,
      },
    });
  }

  async findAll(userId: string, workspaceId?: string, entityType?: string) {
    const where: any = {
      OR: [
        { userId },
        { isPublic: true },
      ],
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    const filters = await this.prisma.savedFilter.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return filters.map((filter) => this.normalizeFilter(filter));
  }

  async findOne(id: string, userId: string) {
    const filter = await this.prisma.savedFilter.findUnique({
      where: { id },
    });

    if (!filter) {
      throw new NotFoundException('Saved filter not found');
    }

    // Check if user has access
    if (filter.userId !== userId && !filter.isPublic) {
      throw new ForbiddenException('Access denied to this filter');
    }

    return this.normalizeFilter(filter);
  }

  async update(id: string, data: UpdateSavedFilterDto, userId: string) {
    const filter = await this.findOne(id, userId);

    // Only owner can update
    if (filter.userId !== userId) {
      throw new ForbiddenException('Only the owner can update this filter');
    }

    return this.prisma.savedFilter.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        filters: data.filters ? JSON.stringify(data.filters) : undefined,
        isPublic: data.isPublic,
      },
    });
  }

  async remove(id: string, userId: string) {
    const filter = await this.findOne(id, userId);

    // Only owner can delete
    if (filter.userId !== userId) {
      throw new ForbiddenException('Only the owner can delete this filter');
    }

    return this.prisma.savedFilter.delete({
      where: { id },
    });
  }

  private normalizeFilter<T extends { filters: string }>(
    filter: T,
  ): Omit<T, 'filters'> & { filters: Record<string, any> } {
    return {
      ...filter,
      filters: this.parseFilters(filter.filters),
    };
  }

  private parseFilters(filters: string): Record<string, any> {
    try {
      const parsed = JSON.parse(filters);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {
      return {};
    }

    return {};
  }
}
