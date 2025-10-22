import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthCheckService } from './health-check/health-check.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly healthCheckService: HealthCheckService, 
  ) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Basic Health Check' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is unhealthy' })
  async healthCheck() {
    return this.healthCheckService.check();
  }

  @Get('health/detailed')
  @ApiOperation({ summary: 'Detailed Health Check' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async detailedHealthCheck() {
    return this.healthCheckService.detailedCheck();
  }

  @Get('info')
  @ApiOperation({ summary: 'API Information' })
  async getInfo() {
    return {
      name: 'Class Booking API',
      version: '1.0.0',
      description: 'Fitness class booking system with credit-based payments',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
