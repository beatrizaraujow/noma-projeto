import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitesService {
  constructor(private prisma: PrismaService) {}

  async create(workspaceId: string, email: string, role: string, invitedById: string) {
    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        user: {
          email,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this workspace');
    }

    // Check for existing pending invite
    const existingInvite = await this.prisma.workspaceInvite.findFirst({
      where: {
        workspaceId,
        email,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return existingInvite;
    }

    // Create new invite
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invite = await this.prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email,
        role,
        token,
        invitedById,
        expiresAt,
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Send email with invite link
    // await this.emailService.sendInvite(invite);

    return invite;
  }

  async findByWorkspace(workspaceId: string) {
    return this.prisma.workspaceInvite.findMany({
      where: {
        workspaceId,
        acceptedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByToken(token: string) {
    const invite = await this.prisma.workspaceInvite.findUnique({
      where: { token },
      include: {
        workspace: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new BadRequestException('Invite has already been accepted');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Invite has expired');
    }

    return invite;
  }

  async accept(token: string, userId: string) {
    const invite = await this.findByToken(token);

    // Verify user email matches invite
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.email !== invite.email) {
      throw new BadRequestException('This invite was sent to a different email address');
    }

    // Check if already a member
    const existingMember = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: invite.workspaceId,
        userId,
      },
    });

    if (existingMember) {
      // Mark invite as accepted anyway
      await this.prisma.workspaceInvite.update({
        where: { id: invite.id },
        data: { acceptedAt: new Date() },
      });
      return existingMember;
    }

    // Create workspace member
    const member = await this.prisma.workspaceMember.create({
      data: {
        workspaceId: invite.workspaceId,
        userId,
        role: invite.role,
      },
      include: {
        workspace: true,
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

    // Mark invite as accepted
    await this.prisma.workspaceInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    return member;
  }

  async revoke(inviteId: string, workspaceId: string) {
    const invite = await this.prisma.workspaceInvite.findFirst({
      where: {
        id: inviteId,
        workspaceId,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return this.prisma.workspaceInvite.delete({
      where: { id: inviteId },
    });
  }
}
