/**
 * أنواع وواجهات تحليل صحة الكود
 */

export interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info' | 'critical';
  category: string;
  message: string;
  details?: string;
  file?: string;
  line?: number;
  timestamp: Date;
  autoFixable?: boolean;
}

export interface HealthReport {
  score: number;
  totalIssues: number;
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  categories: Record<string, number>;
  lastAnalysis: Date;
}
