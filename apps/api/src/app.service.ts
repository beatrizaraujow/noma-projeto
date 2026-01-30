import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealthCheck(): { message: string; timestamp: string; status: string } {
    return {
      message: 'NexORA API is running',
      timestamp: new Date().toISOString(),
      status: 'healthy',
    };
  }
}
