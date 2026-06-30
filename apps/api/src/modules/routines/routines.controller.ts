import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto } from './dto/create-routine.dto';
import { CompleteRoutineDto } from './dto/complete-routine.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('routines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('routines')
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get()
  @ApiOperation({ summary: 'List routines for a workspace' })
  findAll(@Query('workspaceId') workspaceId: string, @Request() req) {
    return this.routinesService.findAll(workspaceId, req.user.userId);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Get routine completion metrics' })
  getMetrics(
    @Query('workspaceId') workspaceId: string,
    @Query('period') period: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.routinesService.getMetrics(workspaceId, period, start, end);
  }

  @Post()
  @ApiOperation({ summary: 'Create a routine (admin only)' })
  create(
    @Body() dto: CreateRoutineDto,
    @Query('workspaceId') workspaceId: string,
    @Request() req,
  ) {
    return this.routinesService.create(workspaceId, dto, req.user.userId);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark routine as completed for current period' })
  complete(
    @Param('id') id: string,
    @Body() dto: CompleteRoutineDto,
    @Request() req,
  ) {
    return this.routinesService.complete(id, req.user.userId, dto.periodKey);
  }

  @Delete(':id/complete')
  @ApiOperation({ summary: 'Unmark routine completion' })
  uncomplete(
    @Param('id') id: string,
    @Query('periodKey') periodKey: string,
    @Request() req,
  ) {
    return this.routinesService.uncomplete(id, req.user.userId, periodKey);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a routine (admin only)' })
  delete(
    @Param('id') id: string,
    @Query('workspaceId') workspaceId: string,
    @Request() req,
  ) {
    return this.routinesService.delete(id, req.user.userId, workspaceId);
  }
}
