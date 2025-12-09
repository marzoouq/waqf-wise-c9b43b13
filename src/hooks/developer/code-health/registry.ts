/**
 * سجل المشاكل والمستمعين
 */

import { productionLogger } from '@/lib/logger/production-logger';
import type { CodeIssue } from './types';

// سجل عام للمشاكل المكتشفة
export const issuesRegistry = new Map<string, CodeIssue>();
export let analysisListeners: ((issues: CodeIssue[]) => void)[] = [];

/**
 * تسجيل مشكلة جديدة
 */
export function registerIssue(issue: Omit<CodeIssue, 'id' | 'timestamp'>): string {
  const id = `${issue.category}-${issue.message}-${Date.now()}`;
  const fullIssue: CodeIssue = {
    ...issue,
    id,
    timestamp: new Date(),
  };
  
  issuesRegistry.set(id, fullIssue);
  
  // إشعار المستمعين
  analysisListeners.forEach(listener => {
    listener(Array.from(issuesRegistry.values()));
  });
  
  // تسجيل في السجل
  if (issue.type === 'critical' || issue.type === 'error') {
    productionLogger.error(`[CodeHealth] ${issue.category}: ${issue.message}`, { details: issue.details });
  }
  
  return id;
}

/**
 * الحصول على جميع المشاكل
 */
export function getAllCodeIssues(): CodeIssue[] {
  return Array.from(issuesRegistry.values());
}

/**
 * مسح جميع المشاكل
 */
export function clearAllCodeIssues(): void {
  issuesRegistry.clear();
}
