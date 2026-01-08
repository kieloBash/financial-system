import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators';

@Controller('health')
export class HealthController {

  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'financial-system-api',
    };
  }
}
