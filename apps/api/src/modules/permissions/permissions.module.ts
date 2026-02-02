import { Module } from '@nestjs/common';
import { PermissionsController } from './permissions.controller';
import { RolesService } from './roles.service';
import { ProjectMembersService } from './project-members.service';
import { GuestAccessService } from './guest-access.service';
import { AuditLogService } from './audit-log.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PermissionsController],
  providers: [
    RolesService,
    ProjectMembersService,
    GuestAccessService,
    AuditLogService,
  ],
  exports: [
    RolesService,
    ProjectMembersService,
    GuestAccessService,
    AuditLogService,
  ],
})
export class PermissionsModule {}
