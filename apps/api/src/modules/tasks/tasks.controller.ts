import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaskFilterDto } from './dto/task-filter.dto';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(
    @Body()
    createTaskDto: {
      title: string;
      description?: string;
      projectId: string;
      assigneeId?: string;
      priority?: string;
      status?: string;
      dueDate?: string;
    },
    @Request() req,
  ) {
    const data = {
      ...createTaskDto,
      dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : undefined,
    };
    return this.tasksService.create(data, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for a project' })
  findAll(@Query('projectId') projectId: string, @Request() req) {
    return this.tasksService.findAll(projectId, req.user.userId);
  }

  @Post('filter')
  @ApiOperation({ summary: 'Get tasks with advanced filters' })
  findWithFilters(@Body() filters: TaskFilterDto, @Request() req) {
    return this.tasksService.findWithFilters(filters, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update task' })
  update(
    @Param('id') id: string,
    @Body()
    updateTaskDto: {
      title?: string;
      description?: string;
      assigneeId?: string;
      priority?: string;
      status?: string;
      dueDate?: string;
      position?: number;
    },
    @Request() req,
  ) {
    const data = {
      ...updateTaskDto,
      dueDate: updateTaskDto.dueDate ? new Date(updateTaskDto.dueDate) : undefined,
    };
    return this.tasksService.update(id, data, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.userId);
  }

  @Put('positions/bulk')
  @ApiOperation({ summary: 'Update task positions (drag & drop)' })
  updatePositions(
    @Body()
    body: {
      projectId: string;
      updates: { id: string; position: number; status?: string }[];
    },
    @Request() req,
  ) {
    return this.tasksService.updatePositions(
      body.projectId,
      body.updates,
      req.user.userId,
    );
  }
}
