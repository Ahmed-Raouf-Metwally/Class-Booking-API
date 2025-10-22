import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestCounter: Counter<string>;
  private httpRequestDuration: Histogram<string>;

  constructor() {
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });
  }

  incrementRequest(method: string, route: string, statusCode: number) {
    this.httpRequestCounter.labels(method, route, statusCode.toString()).inc();
  }

  recordRequestDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.labels(method, route).observe(duration);
  }

  async getMetrics() {
    return await register.metrics();
  }
}
