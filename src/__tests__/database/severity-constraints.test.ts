/**
 * اختبارات توافق Severity مع قيود قاعدة البيانات
 * 
 * هذه الاختبارات تتحقق من أن الكود لا يستخدم قيم severity غير صالحة
 * مع الجداول التي لا تقبلها (مثل استخدام 'info' مع system_alerts)
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { DB_CONSTRAINTS, SEVERITY_RULES } from '@/lib/db-constraints';

// =====================================================
// دوال مساعدة للفحص
// =====================================================

interface SeverityViolation {
  file: string;
  line: number;
  table: string;
  forbiddenValue: string;
  allowedValues: readonly string[];
}

/**
 * فحص ملف للبحث عن استخدامات severity غير صحيحة
 */
function scanFileForViolations(filePath: string): SeverityViolation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: SeverityViolation[] = [];
  
  // فحص كل جدول لا يقبل 'info'
  for (const table of SEVERITY_RULES.tablesWithoutInfo) {
    const tablePattern = new RegExp(`from\\s*\\(\\s*['"\`]${table}['"\`]\\s*\\)`, 'gi');
    
    let match;
    while ((match = tablePattern.exec(content)) !== null) {
      const matchPosition = match.index;
      
      // ابحث في السياق القريب (800 حرف بعد الجدول)
      const contextAfter = content.substring(matchPosition, matchPosition + 800);
      
      // ابحث عن severity: 'info'
      const severityInfoMatch = contextAfter.match(/severity\s*:\s*['"`]info['"`]/i);
      
      if (severityInfoMatch) {
        // احسب رقم السطر
        const textBeforeMatch = content.substring(0, matchPosition);
        const lineNumber = textBeforeMatch.split('\n').length;
        
        violations.push({
          file: filePath,
          line: lineNumber,
          table,
          forbiddenValue: 'info',
          allowedValues: DB_CONSTRAINTS[table].severity,
        });
      }
    }
  }
  
  return violations;
}

/**
 * فحص مجلد بشكل تكراري
 */
function scanDirectoryForViolations(dir: string): SeverityViolation[] {
  const violations: SeverityViolation[] = [];
  
  if (!fs.existsSync(dir)) {
    return violations;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    
    try {
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.git', 'dist', 'build', '__tests__'].includes(item)) {
          violations.push(...scanDirectoryForViolations(fullPath));
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        violations.push(...scanFileForViolations(fullPath));
      }
    } catch {
      // تجاهل أخطاء الوصول
    }
  }
  
  return violations;
}

// =====================================================
// الاختبارات
// =====================================================

describe('Database Severity Constraints Validation', () => {
  let edgeFunctionsPath: string;
  let srcPath: string;
  
  beforeAll(() => {
    // تحديد المسارات
    edgeFunctionsPath = path.join(__dirname, '../../../supabase/functions');
    srcPath = path.join(__dirname, '../../../src');
  });
  
  describe('DB_CONSTRAINTS definitions', () => {
    it('should define system_alerts severity without info', () => {
      expect(DB_CONSTRAINTS.system_alerts.severity).not.toContain('info');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('low');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('medium');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('high');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('critical');
    });
    
    it('should define system_error_logs severity without info', () => {
      expect(DB_CONSTRAINTS.system_error_logs.severity).not.toContain('info');
      expect(DB_CONSTRAINTS.system_error_logs.severity).toContain('low');
    });
    
    it('should define audit_logs severity with info', () => {
      expect(DB_CONSTRAINTS.audit_logs.severity).toContain('info');
    });
  });
  
  describe('Edge Functions severity usage', () => {
    it('should not use severity: info with system_alerts', () => {
      const violations = scanDirectoryForViolations(edgeFunctionsPath);
      const systemAlertsViolations = violations.filter(v => v.table === 'system_alerts');
      
      if (systemAlertsViolations.length > 0) {
        const errorMessages = systemAlertsViolations.map(v => 
          `\n  📍 ${v.file}:${v.line}\n     استخدام '${v.forbiddenValue}' غير مسموح مع ${v.table}\n     القيم المسموحة: ${v.allowedValues.join(', ')}`
        );
        
        expect(
          systemAlertsViolations,
          `تم العثور على ${systemAlertsViolations.length} استخدام غير صحيح لـ severity: 'info' مع system_alerts:${errorMessages.join('')}`
        ).toHaveLength(0);
      }
    });
    
    it('should not use severity: info with system_error_logs', () => {
      const violations = scanDirectoryForViolations(edgeFunctionsPath);
      const errorLogsViolations = violations.filter(v => v.table === 'system_error_logs');
      
      if (errorLogsViolations.length > 0) {
        const errorMessages = errorLogsViolations.map(v => 
          `\n  📍 ${v.file}:${v.line}\n     استخدام '${v.forbiddenValue}' غير مسموح مع ${v.table}`
        );
        
        expect(
          errorLogsViolations,
          `تم العثور على ${errorLogsViolations.length} استخدام غير صحيح:${errorMessages.join('')}`
        ).toHaveLength(0);
      }
    });
  });
  
  describe('Source code severity usage', () => {
    it('should not use severity: info with system_alerts in src/', () => {
      const violations = scanDirectoryForViolations(srcPath);
      const systemAlertsViolations = violations.filter(v => v.table === 'system_alerts');
      
      expect(systemAlertsViolations).toHaveLength(0);
    });
    
    it('should not use severity: info with system_error_logs in src/', () => {
      const violations = scanDirectoryForViolations(srcPath);
      const errorLogsViolations = violations.filter(v => v.table === 'system_error_logs');
      
      expect(errorLogsViolations).toHaveLength(0);
    });
  });
  
  describe('Comprehensive severity check', () => {
    it('should have no severity constraint violations across entire codebase', () => {
      const allViolations = [
        ...scanDirectoryForViolations(edgeFunctionsPath),
        ...scanDirectoryForViolations(srcPath),
      ];
      
      if (allViolations.length > 0) {
        console.log('\n❌ تم العثور على مخالفات severity:');
        allViolations.forEach(v => {
          console.log(`  📍 ${v.file}:${v.line}`);
          console.log(`     الجدول: ${v.table}`);
          console.log(`     القيمة المستخدمة: '${v.forbiddenValue}'`);
          console.log(`     القيم المسموحة: ${v.allowedValues.join(', ')}`);
        });
      }
      
      expect(allViolations).toHaveLength(0);
    });
  });
});

describe('Severity validation functions', () => {
  it('should correctly identify valid system_alerts severity values', () => {
    const { isValidSystemAlertSeverity } = require('@/lib/db-constraints');
    
    expect(isValidSystemAlertSeverity('low')).toBe(true);
    expect(isValidSystemAlertSeverity('medium')).toBe(true);
    expect(isValidSystemAlertSeverity('high')).toBe(true);
    expect(isValidSystemAlertSeverity('critical')).toBe(true);
    expect(isValidSystemAlertSeverity('info')).toBe(false);
    expect(isValidSystemAlertSeverity('invalid')).toBe(false);
  });
  
  it('should correctly identify valid audit_logs severity values', () => {
    const { isValidAuditLogSeverity } = require('@/lib/db-constraints');
    
    expect(isValidAuditLogSeverity('info')).toBe(true);
    expect(isValidAuditLogSeverity('warning')).toBe(true);
    expect(isValidAuditLogSeverity('error')).toBe(true);
    expect(isValidAuditLogSeverity('critical')).toBe(true);
    expect(isValidAuditLogSeverity('low')).toBe(false);
  });
  
  it('should return safe severity values', () => {
    const { getSafeSeverity } = require('@/lib/db-constraints');
    
    // تحويل info إلى low
    expect(getSafeSeverity('system_alerts', 'info')).toBe('low');
    expect(getSafeSeverity('system_error_logs', 'info')).toBe('low');
    
    // الإبقاء على القيم الصحيحة
    expect(getSafeSeverity('system_alerts', 'high')).toBe('high');
    expect(getSafeSeverity('system_error_logs', 'critical')).toBe('critical');
    
    // القيم غير المعروفة تصبح low
    expect(getSafeSeverity('system_alerts', 'unknown')).toBe('low');
  });
});
