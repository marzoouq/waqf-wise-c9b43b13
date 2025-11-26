export interface CacheEntry {
  id: string;
  cache_key: string;
  cache_value: Record<string, any>;
  expires_at: string;
  hit_count: number;
  last_accessed_at: string;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_type: string;
  value: number;
  metric_value?: number;
  metadata?: Record<string, any>;
  recorded_at: string;
}

export interface SlowQueryLog {
  id: string;
  query_text: string;
  execution_time_ms: number;
  user_id?: string;
  parameters?: Record<string, any>;
  created_at: string;
}
