/**
 * أنواع التنبيهات والإشعارات
 */

import type { LucideIcon } from 'lucide-react';

export interface SystemAlert {
  id: string;
  title: string;
  description?: string;
  severity: string;
  status?: string;
  alert_type?: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  resolved_at?: string;
  resolved_by?: string;
  occurrence_count?: number;
  related_error_type?: string;
  metadata?: unknown;
  created_at: string;
  updated_at?: string;
}

export interface SeverityConfig {
  icon: LucideIcon;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
}
