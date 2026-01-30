import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'API Root' })
  getRoot(): { message: string; timestamp: string; status: string } {
    return this.appService.getHealthCheck();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth(): { message: string; timestamp: string; status: string; uptime: number } {
    return {
      ...this.appService.getHealthCheck(),
      uptime: process.uptime(),
    };
  }
}
