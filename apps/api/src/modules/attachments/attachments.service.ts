import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    file: Express.Multer.File,
    data: {
      commentId?: string;
      taskId?: string;
      uploadedBy: string;
    },
  ) {
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

  async findByComment(commentId: string) {
    return this.prisma.attachment.findMany({
      where: { commentId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async findByTask(taskId: string) {
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

  getFilePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
}
