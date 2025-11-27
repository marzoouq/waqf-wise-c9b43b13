export interface CacheEntry {
  id: string;
  cache_key: string;
  cache_value: Record<string, unknown>;
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
  metadata?: Record<string, unknown>;
  recorded_at: string;
}

export interface SlowQueryLog {
  id: string;
  query_text: string;
  execution_time_ms: number;
  user_id?: string;
  parameters?: Record<string, unknown>;
  created_at: string;
}

/**
 * واجهة Chrome Memory API (غير قياسية)
 */
export interface ChromeMemoryInfo {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
}

/**
 * Performance مع دعم Chrome memory
 */
export interface PerformanceWithMemory extends Performance {
  memory?: ChromeMemoryInfo;
}

/**
 * فحص وجود memory API
 */
export function hasMemoryAPI(perf: Performance): perf is PerformanceWithMemory {
  return 'memory' in perf;
}
