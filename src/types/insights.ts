import { Json } from '@/integrations/supabase/types';

/**
 * Types for AI Insights
 */

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  insight_type: 'warning' | 'opportunity' | 'recommendation' | 'trend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Json;
  created_at: string;
}

export interface AIInsightInsert {
  title: string;
  description: string;
  insight_type: 'warning' | 'opportunity' | 'recommendation' | 'trend';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: Json;
}
