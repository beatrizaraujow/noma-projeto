import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum SearchEntityType {
  ALL = 'all',
  TASK = 'task',
  PROJECT = 'project',
  COMMENT = 'comment',
}

export class SearchDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsEnum(SearchEntityType)
  entityType?: SearchEntityType = SearchEntityType.ALL;

  @IsOptional()
  @IsString()
  workspaceId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
