import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class CommentsService {
  constructor(
    private prisma: PrismaService,
    private websocketGateway: WebsocketGateway,
  ) {}

  async create(
    data: {
      content: string;
      taskId: string;
      mentions?: string[];
    },
    userId: string,
  ) {
    // Verify task exists and user has access
    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // Verify user has access to workspace
    const hasAccess = task.project.workspace.members.some(
      (member) => member.userId === userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const contentMentions = [...data.content.matchAll(mentionRegex)].map(
      (match) => match[1],
    );

    const mentions = data.mentions || contentMentions;

    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: userId,
        mentions: this.serializeMentions(mentions),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachments: true,
      },
    });

    const normalizedComment = this.normalizeCommentMentions(comment);

    // Create activity log
    await this.prisma.activity.create({
      data: {
        type: 'comment_added',
        description: `commented on task`,
        projectId: task.projectId,
        taskId: data.taskId,
        userId,
        metadata: JSON.stringify({
          commentId: comment.id,
          content: data.content.substring(0, 100),
        }),
      },
    });

    // Broadcast comment to project
    this.websocketGateway.broadcastCommentAdded(task.projectId, normalizedComment);

    // Send notifications to mentions
    if (normalizedComment.mentions.length > 0) {
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          name: {
            in: normalizedComment.mentions,
          },
        },
      });

      mentionedUsers.forEach((user) => {
        if (user.id !== userId) {
          this.websocketGateway.sendNotification(user.id, {
            type: 'mention',
            title: 'Você foi mencionado',
            message: `${normalizedComment.author.name} mencionou você em um comentário`,
            projectId: task.projectId,
            taskId: data.taskId,
            userId: user.id,
          });
        }
      });
    }

    // Notify task assignee
    if (task.assigneeId && task.assigneeId !== userId) {
      this.websocketGateway.sendNotification(task.assigneeId, {
        type: 'comment_added',
        title: 'Novo comentário',
        message: `${comment.author.name} comentou na tarefa: ${task.title}`,
        projectId: task.projectId,
        taskId: data.taskId,
        userId: task.assigneeId,
      });
    }

    return normalizedComment;
  }

  async findByTask(taskId: string, userId: string) {
    // Verify user has access
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const hasAccess = task.project.workspace.members.some(
      (member) => member.userId === userId,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task');
    }

    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return comments.map((comment) => this.normalizeCommentMentions(comment));
  }

  async update(id: string, content: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Extract mentions from content
    const mentionRegex = /@(\w+)/g;
    const mentions = [...content.matchAll(mentionRegex)].map(
      (match) => match[1],
    );

    const updated = await this.prisma.comment.update({
      where: { id },
      data: {
        content,
        mentions: this.serializeMentions(mentions),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        attachments: true,
      },
    });

    const normalizedUpdated = this.normalizeCommentMentions(updated);

    // Broadcast update
    this.websocketGateway.broadcastCommentUpdated(
      comment.task.projectId,
      normalizedUpdated,
    );

    return normalizedUpdated;
  }

  async remove(id: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({
      where: { id },
    });

    // Broadcast deletion
    this.websocketGateway.broadcastCommentDeleted(comment.task.projectId, id);

    return { success: true };
  }

  private serializeMentions(mentions: string[]): string {
    const sanitizedMentions = mentions.filter(Boolean);
    return JSON.stringify([...new Set(sanitizedMentions)]);
  }

  private normalizeCommentMentions<T extends { mentions: string }>(
    comment: T,
  ): Omit<T, 'mentions'> & { mentions: string[] } {
    return {
      ...comment,
      mentions: this.parseMentions(comment.mentions),
    };
  }

  private parseMentions(mentions: string | null | undefined): string[] {
    if (!mentions) {
      return [];
    }

    try {
      const parsed = JSON.parse(mentions);
      if (Array.isArray(parsed)) {
        return parsed.filter((mention) => typeof mention === 'string');
      }
    } catch {
      return [];
    }

    return [];
  }
}
