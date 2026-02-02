import { IsString, IsOptional, IsArray, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ResourceType, ActionType, PermissionScope } from '@nexora/types';

class PermissionDto {
  @IsEnum(ResourceType)
  resource: ResourceType;

  @IsEnum(ActionType)
  action: ActionType;

  @IsEnum(PermissionScope)
  @IsOptional()
  scope?: PermissionScope;

  @IsOptional()
  conditions?: Record<string, any>;
}

export class CreateCustomRoleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  workspaceId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  permissions: PermissionDto[];
}

export class UpdateCustomRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  @IsOptional()
  permissions?: PermissionDto[];
}

export class CreateProjectMemberDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  canView?: boolean;

  @IsBoolean()
  @IsOptional()
  canEdit?: boolean;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;

  @IsBoolean()
  @IsOptional()
  canManage?: boolean;
}

export class UpdateProjectMemberDto {
  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  roleId?: string;

  @IsBoolean()
  @IsOptional()
  canView?: boolean;

  @IsBoolean()
  @IsOptional()
  canDelete?: boolean;

  @IsBoolean()
  @IsOptional()
  canManage?: boolean;
}
