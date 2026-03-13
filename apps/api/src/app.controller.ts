import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Root' })
  async getRoot(): Promise<{ message: string; timestamp: string; status: string; database: 'up' | 'down' }> {
    return this.appService.getHealthCheck();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  async getHealth(): Promise<{ message: string; timestamp: string; status: string; database: 'up' | 'down'; uptime: number }> {
    const health = await this.appService.getHealthCheck();

    return {
      ...health,
      uptime: process.uptime(),
    };
  }
}
