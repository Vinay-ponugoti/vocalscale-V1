import { env } from '../config/env';

const METRICS_ENDPOINT = `${env.API_URL}/metrics/frontend`;

export type MetricType = 'counter' | 'histogram' | 'gauge';

interface MetricBatch {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp?: number;
}

class MetricsCollector {
  private queue: MetricBatch[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private timer: number | null = null;
  private maxQueueSize: number = 50;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush(true));
    }
  }

  public trackPageView(page: string) {
    this.enqueue({
      name: 'frontend_page_views_total',
      type: 'counter',
      value: 1,
      labels: { page },
    });
  }

  public trackApiLatency(endpoint: string, method: string, status: number, durationSeconds: number) {
    this.enqueue({
      name: 'frontend_api_latency_seconds',
      type: 'histogram',
      value: durationSeconds,
      labels: {
        endpoint: this.normalizeEndpoint(endpoint),
        method: method.toUpperCase(),
        status: status.toString(),
      },
    });
  }

  public trackError(type: string, page: string) {
    this.enqueue({
      name: 'frontend_errors_total',
      type: 'counter',
      value: 1,
      labels: { type, page },
    });
  }

  public trackWebVitals(metric: string, value: number) {
    this.enqueue({
      name: 'frontend_web_vitals_seconds',
      type: 'histogram',
      value: value,
      labels: { metric },
    });
  }

  private normalizeEndpoint(endpoint: string): string {
    // Remove UUIDs and IDs from endpoint to avoid high cardinality in Prometheus
    return endpoint
      .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, ':id')
      .replace(/\/\d+/g, '/:id')
      .split('?')[0];
  }

  private enqueue(batch: MetricBatch) {
    this.queue.push({ ...batch, timestamp: Date.now() / 1000 });
    
    if (this.queue.length >= this.maxQueueSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = window.setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  private async flush(isUnloading = false) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    const payload = JSON.stringify({ metrics: batch });

    if (isUnloading && navigator.sendBeacon) {
      navigator.sendBeacon(METRICS_ENDPOINT, payload);
    } else {
      try {
        await fetch(METRICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: payload,
          // Use keepalive for critical metrics if not unloading
          keepalive: true,
        });
      } catch (e) {
        console.warn('[Metrics] Failed to flush metrics', e);
        // Put back in queue if failed and not unloading
        if (!isUnloading) {
          this.queue = [...batch, ...this.queue].slice(0, this.maxQueueSize);
        }
      }
    }
  }
}

export const metrics = new MetricsCollector();
