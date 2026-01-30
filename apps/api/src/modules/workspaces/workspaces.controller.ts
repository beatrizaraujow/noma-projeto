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
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  async create(@Body() body: { name: string }, @Request() req) {
    return this.workspacesService.create(body.name, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all workspaces for current user' })
  async findAll(@Request() req) {
    return this.workspacesService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.workspacesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workspace' })
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; logo?: string },
    @Request() req,
  ) {
    return this.workspacesService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workspace' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.workspacesService.delete(id, req.user.userId);
  }

  @Put(':id/members/:memberId/role')
  @ApiOperation({ summary: 'Update member role' })
  async updateMemberRole(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: string },
    @Request() req,
  ) {
    return this.workspacesService.updateMemberRole(
      id,
      req.user.userId,
      memberId,
      body.role,
    );
  }

  @Delete(':id/members/:memberId')
  @ApiOperation({ summary: 'Remove member from workspace' })
  async removeMember(
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Request() req,
  ) {
    return this.workspacesService.removeMember(id, req.user.userId, memberId);
  }
}
