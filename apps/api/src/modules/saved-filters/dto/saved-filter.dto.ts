import { IsString, IsOptional, IsBoolean, IsEnum, IsObject } from 'class-validator';

export enum FilterEntityType {
  TASK = 'task',
  PROJECT = 'project',
  ACTIVITY = 'activity',
}

export class CreateSavedFilterDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FilterEntityType)
  entityType: FilterEntityType;

  @IsObject()
  filters: Record<string, any>;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = false;
}

export class UpdateSavedFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
