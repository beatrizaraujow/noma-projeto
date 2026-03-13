import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ImportsService } from './imports.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

type ImportEntity = 'projects' | 'tasks' | 'customers';

@ApiTags('imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post('csv')
  @ApiOperation({ summary: 'Import CSV data for projects, tasks, or customers' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(
    @UploadedFile() file: Express.Multer.File,
    @Query('entity') entity: ImportEntity,
    @Query('workspaceId') workspaceId: string,
    @Request() req,
  ) {
    if (!entity || !['projects', 'tasks', 'customers'].includes(entity)) {
      throw new BadRequestException('Invalid entity. Use projects, tasks, or customers');
    }

    if (!workspaceId) {
      throw new BadRequestException('workspaceId is required');
    }

    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    const content = file.buffer?.toString('utf-8') || '';
    if (!content.trim()) {
      throw new BadRequestException('CSV file is empty');
    }

    return this.importsService.importCsv({
      entity,
      workspaceId,
      userId: req.user.userId,
      csvContent: content,
    });
  }

  @Get('template')
  @ApiOperation({ summary: 'Get CSV template by entity (projects, tasks, customers)' })
  getTemplate(@Query('entity') entity: ImportEntity) {
    if (!entity || !['projects', 'tasks', 'customers'].includes(entity)) {
      throw new BadRequestException('Invalid entity. Use projects, tasks, or customers');
    }

    const csv = this.importsService.getTemplate(entity);
    return {
      entity,
      csv,
    };
  }
}
