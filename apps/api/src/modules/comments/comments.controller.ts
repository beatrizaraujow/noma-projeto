import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth()
@Controller('api/comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Body()
    body: {
      content: string;
      taskId: string;
      mentions?: string[];
    },
    @Request() req: any,
  ) {
    return this.commentsService.create(body, req.user.userId);
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string, @Request() req: any) {
    return this.commentsService.findByTask(taskId, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    return this.commentsService.update(id, body.content, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.remove(id, req.user.userId);
  }
}
