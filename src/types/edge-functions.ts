/**
 * Edge Functions Types - أنواع بيانات Edge Functions
 * 
 * أنواع محددة بدلاً من any لتحسين جودة الكود والأمان
 */

// ==========================================
// Auto Fix Types
// ==========================================

export interface AutoFixEntry {
  fixId: string;
  fixType: string;
  appliedAt: string;
  result: 'success' | 'failed' | 'partial';
  details?: string;
  rollbackAvailable: boolean;
}

// ==========================================
// Pending Fix Types
// ==========================================

export interface PendingFixEntry {
  id: string;
  category: string;
  description: string;
  sql?: string;
  priority: 'high' | 'medium' | 'low';
}

// ==========================================
// Edge Function Health Types
// ==========================================

export interface EdgeFunctionHealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded' | 'unknown' | 'protected';
  lastCheck: string;
  responseTime?: number;
  error?: string;
  isProtected?: boolean;
  statusReason?: string;
  recommendation?: string;
}

export interface EdgeFunctionInvokeResult<T = unknown> {
  data: T | null;
  error: Error | null;
}

// ==========================================
// AI Audit Types
// ==========================================

export interface AIAuditResponse {
  success: boolean;
  auditId?: string;
  error?: string;
  findings?: AuditFindingResult[];
}

export interface AuditFindingResult {
  id: string;
  category: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  autoFixable: boolean;
}

// ==========================================
// Database Health Types
// ==========================================

export interface DatabaseHealthMetrics {
  connectionCount: number;
  activeQueries: number;
  cacheHitRatio: number;
  tableBloat: TableBloatInfo[];
  slowQueries: SlowQueryInfo[];
}

export interface TableBloatInfo {
  tableName: string;
  bloatRatio: number;
  estimatedWaste: number;
}

export interface SlowQueryInfo {
  query: string;
  avgDuration: number;
  callCount: number;
}

// ==========================================
// Notification Types
// ==========================================

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SlackAlertPayload {
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info' | 'success';
  fields?: Array<{ label: string; value: string }>;
  actionUrl?: string;
}

// ==========================================
// Backup Types
// ==========================================

export interface BackupResult {
  success: boolean;
  backupId?: string;
  filePath?: string;
  fileSize?: number;
  tablesIncluded?: string[];
  error?: string;
}

// ==========================================
// Distribution Types
// ==========================================

export interface DistributionSimulationResult {
  totalAmount: number;
  beneficiaryCount: number;
  allocations: BeneficiaryAllocation[];
  warnings?: string[];
}

export interface BeneficiaryAllocation {
  beneficiaryId: string;
  beneficiaryName: string;
  amount: number;
  percentage: number;
}

// ==========================================
// Generic Function Result
// ==========================================

export interface EdgeFunctionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, unknown>;
}
