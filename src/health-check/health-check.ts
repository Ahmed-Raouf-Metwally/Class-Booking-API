import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthCheckService {
  constructor(@InjectConnection() private connection: Connection) {}

  async check(): Promise<{ 
    status: string; 
    database: string; 
    timestamp: string;
    uptime: number;
    memory: {
      used: string;
      total: string;
      percentage: string;
    };
  }> {
    const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Memory usage
    const used = process.memoryUsage();
    const usedMB = Math.round(used.heapUsed / 1024 / 1024);
    const totalMB = Math.round(used.heapTotal / 1024 / 1024);
    const percentage = Math.round((used.heapUsed / used.heapTotal) * 100);

    return {
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      memory: {
        used: `${usedMB} MB`,
        total: `${totalMB} MB`,
        percentage: `${percentage}%`
      }
    };
  }

  async detailedCheck(): Promise<any> {
    const basicHealth = await this.check();
    
    return {
      ...basicHealth,
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      platform: process.platform,
      dependencies: {
        mongoose: 'connected',
        nestjs: 'active'
      }
    };
  }
}