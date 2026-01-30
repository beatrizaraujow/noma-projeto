import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @Body()
    createProjectDto: {
      workspaceId: string;
      name: string;
      description?: string;
      color?: string;
      icon?: string;
    },
    @Request() req,
  ) {
    const { workspaceId, ...data } = createProjectDto;
    return this.projectsService.create(workspaceId, data, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects for workspace' })
  findAll(@Query('workspaceId') workspaceId: string, @Request() req) {
    return this.projectsService.findAll(workspaceId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update project' })
  update(
    @Param('id') id: string,
    @Body()
    updateProjectDto: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
    },
    @Request() req,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.userId);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to project' })
  addMember(
    @Param('id') id: string,
    @Body() body: { memberId: string },
    @Request() req,
  ) {
    return this.projectsService.addMember(id, body.memberId, req.user.userId);
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from project' })
  removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.projectsService.removeMember(id, memberId, req.user.userId);
  }
}
