/**
 * اختبارات توافق أسماء الأعمدة مع قاعدة البيانات
 * 
 * هذه الاختبارات تتحقق من أن الكود لا يستخدم أسماء أعمدة قديمة/خاطئة
 * مثل استخدام 'address' بدلاً من 'location' في جدول properties
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { COLUMN_RULES, DEPRECATED_COLUMNS, TABLE_COLUMNS } from '@/lib/db-constraints';

// =====================================================
// دوال مساعدة للفحص
// =====================================================

interface ColumnViolation {
  file: string;
  line: number;
  table: string;
  deprecatedColumn: string;
  correctColumn: string;
}

/**
 * فحص ملف للبحث عن استخدامات أسماء أعمدة خاطئة
 */
function scanFileForColumnViolations(filePath: string): ColumnViolation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations: ColumnViolation[] = [];
  
  // فحص جدول properties
  const propertiesPattern = /from\s*\(\s*['"`]properties['"`]\s*\)/gi;
  const forbiddenColumns = COLUMN_RULES.forbiddenColumns.properties || [];
  const corrections = COLUMN_RULES.corrections.properties || {};
  
  let match;
  while ((match = propertiesPattern.exec(content)) !== null) {
    const matchPosition = match.index;
    const contextAfter = content.substring(matchPosition, matchPosition + 1000);
    
    for (const deprecatedColumn of forbiddenColumns) {
      // أنماط البحث عن العمود الممنوع
      const columnPatterns = [
        new RegExp(`\\.select\\s*\\([^)]*['"\`]${deprecatedColumn}['"\`]`, 'i'),
        new RegExp(`[{,]\\s*${deprecatedColumn}\\s*:`, 'i'),
        new RegExp(`\\.${deprecatedColumn}\\b`, 'i'),
        new RegExp(`\\['${deprecatedColumn}'\\]`, 'i'),
      ];
      
      for (const colPattern of columnPatterns) {
        if (colPattern.test(contextAfter)) {
          const textBeforeMatch = content.substring(0, matchPosition);
          const lineNumber = textBeforeMatch.split('\n').length;
          
          violations.push({
            file: filePath,
            line: lineNumber,
            table: 'properties',
            deprecatedColumn,
            correctColumn: corrections[deprecatedColumn as keyof typeof corrections] || deprecatedColumn,
          });
          
          break;
        }
      }
    }
  }
  
  return violations;
}

/**
 * فحص مجلد بشكل تكراري
 */
function scanDirectoryForColumnViolations(dir: string): ColumnViolation[] {
  const violations: ColumnViolation[] = [];
  
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
          violations.push(...scanDirectoryForColumnViolations(fullPath));
        }
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        violations.push(...scanFileForColumnViolations(fullPath));
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

describe('Database Column Names Validation', () => {
  let edgeFunctionsPath: string;
  let srcPath: string;
  
  beforeAll(() => {
    edgeFunctionsPath = path.join(__dirname, '../../../supabase/functions');
    srcPath = path.join(__dirname, '../../../src');
  });
  
  describe('COLUMN_RULES definitions', () => {
    it('should define forbidden columns for properties table', () => {
      expect(COLUMN_RULES.forbiddenColumns.properties).toContain('address');
      expect(COLUMN_RULES.forbiddenColumns.properties).toContain('property_type');
    });
    
    it('should define corrections for properties table', () => {
      expect(COLUMN_RULES.corrections.properties.address).toBe('location');
      expect(COLUMN_RULES.corrections.properties.property_type).toBe('type');
    });
  });
  
  describe('TABLE_COLUMNS definitions', () => {
    it('should define properties columns with location', () => {
      expect(TABLE_COLUMNS.properties).toContain('location');
      expect(TABLE_COLUMNS.properties).not.toContain('address');
    });
    
    it('should define properties columns with type', () => {
      expect(TABLE_COLUMNS.properties).toContain('type');
    });
    
    it('should define beneficiaries columns', () => {
      expect(TABLE_COLUMNS.beneficiaries).toContain('full_name');
      expect(TABLE_COLUMNS.beneficiaries).toContain('national_id');
      // beneficiaries يحتفظ بـ address لأنه اسم صحيح هناك
      expect(TABLE_COLUMNS.beneficiaries).toContain('address');
    });
  });
  
  describe('Edge Functions column usage', () => {
    it('should not use address column with properties table', () => {
      const violations = scanDirectoryForColumnViolations(edgeFunctionsPath);
      const addressViolations = violations.filter(
        v => v.table === 'properties' && v.deprecatedColumn === 'address'
      );
      
      if (addressViolations.length > 0) {
        const errorMessages = addressViolations.map(v => 
          `\n  📍 ${v.file}:${v.line}\n     استخدم '${v.correctColumn}' بدلاً من '${v.deprecatedColumn}'`
        );
        
        expect(
          addressViolations,
          `تم العثور على ${addressViolations.length} استخدام خاطئ لـ 'address' مع properties:${errorMessages.join('')}`
        ).toHaveLength(0);
      }
    });
    
    it('should not use property_type column with properties table', () => {
      const violations = scanDirectoryForColumnViolations(edgeFunctionsPath);
      const typeViolations = violations.filter(
        v => v.table === 'properties' && v.deprecatedColumn === 'property_type'
      );
      
      expect(typeViolations).toHaveLength(0);
    });
  });
  
  describe('Source code column usage', () => {
    it('should not use deprecated column names with properties in src/', () => {
      const violations = scanDirectoryForColumnViolations(srcPath);
      const propertiesViolations = violations.filter(v => v.table === 'properties');
      
      expect(propertiesViolations).toHaveLength(0);
    });
  });
  
  describe('Comprehensive column check', () => {
    it('should have no column name violations across entire codebase', () => {
      const allViolations = [
        ...scanDirectoryForColumnViolations(edgeFunctionsPath),
        ...scanDirectoryForColumnViolations(srcPath),
      ];
      
      if (allViolations.length > 0) {
        console.log('\n❌ تم العثور على أسماء أعمدة خاطئة:');
        allViolations.forEach(v => {
          console.log(`  📍 ${v.file}:${v.line}`);
          console.log(`     الجدول: ${v.table}`);
          console.log(`     العمود المستخدم: '${v.deprecatedColumn}'`);
          console.log(`     العمود الصحيح: '${v.correctColumn}'`);
        });
      }
      
      expect(allViolations).toHaveLength(0);
    });
  });
});

describe('DEPRECATED_COLUMNS documentation', () => {
  it('should document address -> location change for properties', () => {
    expect(DEPRECATED_COLUMNS.address.tables).toContain('properties');
    expect(DEPRECATED_COLUMNS.address.correctName).toBe('location');
  });
  
  it('should document property_type -> type change for properties', () => {
    expect(DEPRECATED_COLUMNS.property_type.tables).toContain('properties');
    expect(DEPRECATED_COLUMNS.property_type.correctName).toBe('type');
  });
});

describe('Column validation functions', () => {
  it('should correctly validate columns for properties table', () => {
    const { isValidColumn } = require('@/lib/db-constraints');
    
    expect(isValidColumn('properties', 'location')).toBe(true);
    expect(isValidColumn('properties', 'type')).toBe(true);
    expect(isValidColumn('properties', 'name')).toBe(true);
    expect(isValidColumn('properties', 'nonexistent')).toBe(false);
  });
  
  it('should return correct column names', () => {
    const { getCorrectColumnName } = require('@/lib/db-constraints');
    
    expect(getCorrectColumnName('properties', 'address')).toBe('location');
    expect(getCorrectColumnName('properties', 'property_type')).toBe('type');
    expect(getCorrectColumnName('properties', 'location')).toBeNull();
  });
});
