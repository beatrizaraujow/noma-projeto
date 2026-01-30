import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('activities')
@ApiBearerAuth()
@Controller('api/activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string, @Request() req: any) {
    return this.activitiesService.findByProject(projectId, req.user.userId);
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string, @Request() req: any) {
    return this.activitiesService.findByTask(taskId, req.user.userId);
  }
}
