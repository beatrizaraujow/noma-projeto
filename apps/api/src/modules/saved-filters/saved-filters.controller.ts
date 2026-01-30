import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SavedFiltersService } from './saved-filters.service';
import { CreateSavedFilterDto, UpdateSavedFilterDto } from './dto/saved-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('saved-filters')
@UseGuards(JwtAuthGuard)
export class SavedFiltersController {
  constructor(private readonly savedFiltersService: SavedFiltersService) {}

  @Post()
  create(@Body() createDto: CreateSavedFilterDto, @Request() req) {
    return this.savedFiltersService.create(createDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('workspaceId') workspaceId: string,
    @Query('entityType') entityType: string,
    @Request() req,
  ) {
    return this.savedFiltersService.findAll(req.user.id, workspaceId, entityType);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.savedFiltersService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateSavedFilterDto, @Request() req) {
    return this.savedFiltersService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.savedFiltersService.remove(id, req.user.id);
  }
}
