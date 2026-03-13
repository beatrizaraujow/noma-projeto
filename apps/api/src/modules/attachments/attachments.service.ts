import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class AttachmentsService {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  private async canAccessTask(taskId: string, userId: string): Promise<boolean> {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          workspace: {
            members: {
              some: { userId },
            },
          },
        },
      },
      select: { id: true },
    });

    return Boolean(task);
  }

  async create(
    file: Express.Multer.File,
    data: {
      commentId?: string;
      taskId?: string;
      uploadedBy: string;
    },
  ) {
    if (!data.taskId && !data.commentId) {
      throw new ForbiddenException('Attachment must be linked to a task or comment');
    }

    if (data.taskId) {
      const canAccess = await this.canAccessTask(data.taskId, data.uploadedBy);
      if (!canAccess) {
        throw new ForbiddenException('You do not have access to attach files to this task');
      }
    }

    if (data.commentId) {
      const comment = await this.prisma.comment.findUnique({
        where: { id: data.commentId },
        select: { taskId: true },
      });

      if (!comment) {
        throw new NotFoundException('Comment not found');
      }

      const canAccess = await this.canAccessTask(comment.taskId, data.uploadedBy);
      if (!canAccess) {
        throw new ForbiddenException('You do not have access to attach files to this comment');
      }
    }

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const filename = `${randomBytes(16).toString('hex')}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // Save file
    fs.writeFileSync(filepath, file.buffer);

    // Create attachment record
    const attachment = await this.prisma.attachment.create({
      data: {
        filename: file.originalname,
        url: `/uploads/${filename}`,
        size: file.size,
        mimeType: file.mimetype,
        commentId: data.commentId,
        taskId: data.taskId,
        uploadedBy: data.uploadedBy,
      },
    });

    return attachment;
  }

  async findByComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          select: { id: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const hasAccess = await this.canAccessTask(comment.taskId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this comment attachments');
    }

    return this.prisma.attachment.findMany({
      where: { commentId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByTask(taskId: string, userId: string) {
    const hasAccess = await this.canAccessTask(taskId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this task attachments');
    }

    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async remove(id: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    // Verify user uploaded the file
    if (attachment.uploadedBy !== userId) {
      throw new NotFoundException('You can only delete your own attachments');
    }

    // Delete file
    const filepath = path.join(process.cwd(), attachment.url);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    // Delete record
    await this.prisma.attachment.delete({
      where: { id },
    });

    return { success: true };
  }

  async getAuthorizedFilePath(filename: string, userId: string): Promise<string> {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        url: `/uploads/${filename}`,
      },
      include: {
        comment: {
          select: { taskId: true },
        },
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const taskId = attachment.taskId || attachment.comment?.taskId;
    if (!taskId) {
      throw new NotFoundException('Attachment task reference not found');
    }

    const hasAccess = await this.canAccessTask(taskId, userId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this attachment');
    }

    return path.join(this.uploadDir, filename);
  }
}
