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

    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        taskId: data.taskId,
        authorId: userId,
        mentions: data.mentions || contentMentions,
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

    // Create activity log
    await this.prisma.activity.create({
      data: {
        type: 'comment_added',
        description: `commented on task`,
        projectId: task.projectId,
        taskId: data.taskId,
        userId,
        metadata: {
          commentId: comment.id,
          content: data.content.substring(0, 100),
        },
      },
    });

    // Broadcast comment to project
    this.websocketGateway.broadcastCommentAdded(task.projectId, comment);

    // Send notifications to mentions
    if (comment.mentions && comment.mentions.length > 0) {
      const mentionedUsers = await this.prisma.user.findMany({
        where: {
          name: {
            in: comment.mentions,
          },
        },
      });

      mentionedUsers.forEach((user) => {
        if (user.id !== userId) {
          this.websocketGateway.sendNotification(user.id, {
            type: 'mention',
            title: 'Você foi mencionado',
            message: `${comment.author.name} mencionou você em um comentário`,
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

    return comment;
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

    return this.prisma.comment.findMany({
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
        mentions,
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

    // Broadcast update
    this.websocketGateway.broadcastCommentUpdated(
      comment.task.projectId,
      updated,
    );

    return updated;
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
}
