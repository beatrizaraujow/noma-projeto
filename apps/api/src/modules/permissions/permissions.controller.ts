import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { ProjectMembersService } from './project-members.service';
import { GuestAccessService } from './guest-access.service';
import { AuditLogService } from './audit-log.service';
import {
  CreateCustomRoleDto,
  UpdateCustomRoleDto,
  CreateProjectMemberDto,
  UpdateProjectMemberDto,
} from './dto/permissions.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private rolesService: RolesService,
    private projectMembersService: ProjectMembersService,
    private guestAccessService: GuestAccessService,
    private auditLogService: AuditLogService
  ) {}

  // ==================== CUSTOM ROLES ====================

  @Post('roles')
  async createRole(@Body() data: CreateCustomRoleDto, @Request() req) {
    const role = await this.rolesService.createCustomRole(data, req.user.id);
    await this.auditLogService.logCreate(
      req.user.id,
      'role',
      role.id,
      `Criou role customizado: ${role.name}`
    );
    return role;
  }

  @Get('roles')
  async getRoles(@Query('workspaceId') workspaceId?: string) {
    return this.rolesService.findAllCustomRoles(workspaceId);
  }

  @Get('roles/:id')
  async getRole(@Param('id') id: string) {
    return this.rolesService.findCustomRole(id);
  }

  @Put('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() data: UpdateCustomRoleDto,
    @Request() req
  ) {
    const role = await this.rolesService.updateCustomRole(id, data, req.user.id);
    await this.auditLogService.logUpdate(
      req.user.id,
      'role',
      id,
      `Atualizou role: ${role.name}`
    );
    return role;
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string, @Request() req) {
    const result = await this.rolesService.deleteCustomRole(id);
    await this.auditLogService.logDelete(
      req.user.id,
      'role',
      id,
      'Deletou role customizado'
    );
    return result;
  }

  @Post('roles/initialize')
  async initializeSystemRoles() {
    return this.rolesService.initializeSystemRoles();
  }

  // ==================== PROJECT MEMBERS ====================

  @Post('projects/:projectId/members')
  async addMember(
    @Param('projectId') projectId: string,
    @Body() data: CreateProjectMemberDto,
    @Request() req
  ) {
    const member = await this.projectMembersService.addProjectMember(
      projectId,
      data,
      req.user.id
    );
    await this.auditLogService.logPermission(
      req.user.id,
      'member_add',
      data.userId,
      projectId,
      `Adicionou ${member.user.name} ao projeto com role ${member.role}`
    );
    return member;
  }

  @Get('projects/:projectId/members')
  async getMembers(@Param('projectId') projectId: string, @Request() req) {
    return this.projectMembersService.findProjectMembers(projectId, req.user.id);
  }

  @Get('projects/:projectId/members/:userId/permissions')
  async getMemberPermissions(
    @Param('projectId') projectId: string,
    @Param('userId') userId: string
  ) {
    return this.projectMembersService.getMemberPermissions(projectId, userId);
  }

  @Put('projects/:projectId/members/:memberId')
  async updateMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Body() data: UpdateProjectMemberDto,
    @Request() req
  ) {
    const member = await this.projectMembersService.updateProjectMember(
      projectId,
      memberId,
      data,
      req.user.id
    );
    await this.auditLogService.logPermission(
      req.user.id,
      'permission_update',
      member.userId,
      projectId,
      `Atualizou permissões de ${member.user.name}`
    );
    return member;
  }

  @Delete('projects/:projectId/members/:memberId')
  async removeMember(
    @Param('projectId') projectId: string,
    @Param('memberId') memberId: string,
    @Request() req
  ) {
    const result = await this.projectMembersService.removeProjectMember(
      projectId,
      memberId,
      req.user.id
    );
    await this.auditLogService.logPermission(
      req.user.id,
      'member_remove',
      memberId,
      projectId,
      'Removeu membro do projeto'
    );
    return result;
  }

  // ==================== GUEST ACCESS ====================

  @Post('projects/:projectId/guest-access')
  async createGuestAccess(
    @Param('projectId') projectId: string,
    @Body() data: any,
    @Request() req
  ) {
    const access = await this.guestAccessService.createGuestAccess(
      { ...data, projectId },
      req.user.id
    );
    await this.auditLogService.logCreate(
      req.user.id,
      'guest_access',
      access.id,
      `Criou acesso guest para ${data.email}`
    );
    return access;
  }

  @Get('projects/:projectId/guest-access')
  async getGuestAccesses(@Param('projectId') projectId: string, @Request() req) {
    return this.guestAccessService.findGuestAccesses(projectId, req.user.id);
  }

  @Get('guest-access/:token')
  async validateGuestAccess(@Param('token') token: string) {
    return this.guestAccessService.findByToken(token);
  }

  @Delete('guest-access/:id')
  async revokeGuestAccess(@Param('id') id: string, @Request() req) {
    const access = await this.guestAccessService.revokeGuestAccess(id, req.user.id);
    await this.auditLogService.logDelete(
      req.user.id,
      'guest_access',
      id,
      'Revogou acesso guest'
    );
    return access;
  }

  // ==================== AUDIT LOGS ====================

  @Get('audit-logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('resource') resource?: string,
    @Query('resourceId') resourceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditLogService.findLogs({
      userId,
      action,
      resource,
      resourceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('audit-logs/project/:projectId')
  async getProjectAuditLogs(
    @Param('projectId') projectId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditLogService.findProjectLogs(
      projectId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50
    );
  }

  @Get('audit-logs/user/:userId')
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.auditLogService.findUserLogs(
      userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50
    );
  }

  @Get('audit-logs/stats')
  async getAuditStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.auditLogService.getStats(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }
}
