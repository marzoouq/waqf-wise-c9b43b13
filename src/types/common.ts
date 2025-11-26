/**
 * أنواع مشتركة عامة في التطبيق
 */

export interface DeviceInfo {
  browser?: string;
  os?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  screen_resolution?: string;
  timezone?: string;
  language?: string;
}

export interface Location {
  ip?: string;
  country?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
}

export interface SearchCriteria {
  search_term?: string;
  category?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  tags?: string[];
  custom_filters?: Record<string, unknown>;
}

export interface PaginationParams {
  page: number;
  page_size: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface ApiResponse<T = unknown> {
  data: T;
  error?: string;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface ResponseMetadata {
  total?: number;
  page?: number;
  page_size?: number;
  has_more?: boolean;
  execution_time?: number;
}

export interface StatisticsData {
  total?: number;
  count?: number;
  average?: number;
  sum?: number;
  percentage?: number;
  [key: string]: number | undefined;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
}
