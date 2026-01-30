import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AttachmentsService } from './attachments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as fs from 'fs';

@ApiTags('attachments')
@ApiBearerAuth()
@Controller('api/attachments')
@UseGuards(JwtAuthGuard)
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        commentId: {
          type: 'string',
        },
        taskId: {
          type: 'string',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const commentId = req.body.commentId;
    const taskId = req.body.taskId;

    return this.attachmentsService.create(file, {
      commentId,
      taskId,
      uploadedBy: req.user.userId,
    });
  }

  @Get('comment/:commentId')
  findByComment(@Param('commentId') commentId: string) {
    return this.attachmentsService.findByComment(commentId);
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.attachmentsService.findByTask(taskId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.attachmentsService.remove(id, req.user.userId);
  }

  @Get('download/:filename')
  download(@Param('filename') filename: string, @Res() res: Response) {
    const filepath = this.attachmentsService.getFilePath(filename);
    
    if (!fs.existsSync(filepath)) {
      throw new BadRequestException('File not found');
    }

    res.download(filepath);
  }
}
