import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export type SignupMethod = 'email' | 'google';

export type SignupOrigin = {
  source?: string;
  utmSource?: string;
  campaign?: string;
  inviteToken?: string;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: { email: string; password: string; name: string }) {
    return this.prisma.user.create({
      data: {
        ...data,
        role: 'USER',
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async upsertOAuthUser(data: {
    email: string;
    name: string;
    avatar?: string;
    generatedPasswordHash: string;
  }): Promise<{ user: any; isNew: boolean }> {
    const existing = await this.findByEmail(data.email);

    if (existing) {
      const user = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          name: data.name || existing.name,
          avatar: data.avatar || existing.avatar,
        },
      });

      return { user, isNew: false };
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        password: data.generatedPasswordHash,
        role: 'USER',
      },
    });

    return { user, isNew: true };
  }

  async recordSignupEvent(params: {
    userId: string;
    email: string;
    name: string;
    method: SignupMethod;
    workspaceId?: string | null;
    origin?: SignupOrigin;
  }) {
    const { userId, email, name, method, workspaceId, origin } = params;

    return this.prisma.auditLog.create({
      data: {
        userId,
        action: 'signup',
        resource: 'auth',
        resourceId: userId,
        description: `User signup via ${method}`,
        metadata: JSON.stringify({
          method,
          name,
          email,
          workspaceId: workspaceId || null,
          source: origin?.source || null,
          utmSource: origin?.utmSource || null,
          campaign: origin?.campaign || null,
          inviteToken: origin?.inviteToken || null,
          recordedAt: new Date().toISOString(),
        }),
      },
    });
  }

  async update(id: string, data: { name?: string; email?: string }) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
