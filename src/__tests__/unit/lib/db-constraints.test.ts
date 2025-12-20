/**
 * اختبارات قيود قاعدة البيانات
 */
import { describe, it, expect } from 'vitest';
import {
  DB_CONSTRAINTS,
  DEPRECATED_COLUMNS,
  TABLE_COLUMNS,
  COLUMN_RULES,
  SEVERITY_RULES,
  isValidSystemAlertSeverity,
  isValidAuditLogSeverity,
  isValidSystemErrorLogSeverity,
  getSafeSeverity,
  isValidColumn,
  getCorrectColumnName,
} from '@/lib/db-constraints';

describe('DB Constraints', () => {
  describe('DB_CONSTRAINTS', () => {
    it('should define severity constraints for system_alerts', () => {
      expect(DB_CONSTRAINTS.system_alerts).toBeDefined();
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('low');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('medium');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('high');
      expect(DB_CONSTRAINTS.system_alerts.severity).toContain('critical');
    });

    it('should NOT allow info in system_alerts severity', () => {
      expect(DB_CONSTRAINTS.system_alerts.severity).not.toContain('info');
    });

    it('should allow info in audit_logs severity', () => {
      expect(DB_CONSTRAINTS.audit_logs.severity).toContain('info');
    });

    it('should define tables that use severity', () => {
      expect(DB_CONSTRAINTS.system_alerts.severity).toBeDefined();
      expect(DB_CONSTRAINTS.audit_logs.severity).toBeDefined();
      expect(DB_CONSTRAINTS.system_error_logs.severity).toBeDefined();
    });
  });

  describe('isValidSystemAlertSeverity', () => {
    it('should return true for valid severities', () => {
      expect(isValidSystemAlertSeverity('low')).toBe(true);
      expect(isValidSystemAlertSeverity('medium')).toBe(true);
      expect(isValidSystemAlertSeverity('high')).toBe(true);
      expect(isValidSystemAlertSeverity('critical')).toBe(true);
    });

    it('should return false for info (not allowed in system_alerts)', () => {
      expect(isValidSystemAlertSeverity('info')).toBe(false);
    });

    it('should return false for invalid severities', () => {
      expect(isValidSystemAlertSeverity('severe')).toBe(false);
      expect(isValidSystemAlertSeverity('warning')).toBe(false);
      expect(isValidSystemAlertSeverity('error')).toBe(false);
      expect(isValidSystemAlertSeverity('')).toBe(false);
    });
  });

  describe('isValidAuditLogSeverity', () => {
    it('should return true for valid severities including info', () => {
      expect(isValidAuditLogSeverity('info')).toBe(true);
      expect(isValidAuditLogSeverity('warning')).toBe(true);
      expect(isValidAuditLogSeverity('error')).toBe(true);
      expect(isValidAuditLogSeverity('critical')).toBe(true);
    });

    it('should return false for invalid severities', () => {
      expect(isValidAuditLogSeverity('low')).toBe(false);
      expect(isValidAuditLogSeverity('medium')).toBe(false);
      expect(isValidAuditLogSeverity('high')).toBe(false);
    });
  });

  describe('isValidSystemErrorLogSeverity', () => {
    it('should return true for valid severities', () => {
      expect(isValidSystemErrorLogSeverity('low')).toBe(true);
      expect(isValidSystemErrorLogSeverity('medium')).toBe(true);
      expect(isValidSystemErrorLogSeverity('high')).toBe(true);
      expect(isValidSystemErrorLogSeverity('critical')).toBe(true);
    });

    it('should return false for info (not allowed)', () => {
      expect(isValidSystemErrorLogSeverity('info')).toBe(false);
    });
  });

  describe('getSafeSeverity', () => {
    it('should return the same severity if valid', () => {
      expect(getSafeSeverity('system_alerts', 'low')).toBe('low');
      expect(getSafeSeverity('system_alerts', 'high')).toBe('high');
    });

    it('should convert info to low for system_alerts', () => {
      expect(getSafeSeverity('system_alerts', 'info')).toBe('low');
    });

    it('should convert info to low for system_error_logs', () => {
      expect(getSafeSeverity('system_error_logs', 'info')).toBe('low');
    });

    it('should return low for unknown severities', () => {
      expect(getSafeSeverity('system_alerts', 'unknown')).toBe('low');
    });
  });

  describe('SEVERITY_RULES', () => {
    it('should list tables without info support', () => {
      expect(SEVERITY_RULES.tablesWithoutInfo).toContain('system_alerts');
      expect(SEVERITY_RULES.tablesWithoutInfo).toContain('system_error_logs');
    });

    it('should list tables with info support', () => {
      expect(SEVERITY_RULES.tablesWithInfo).toContain('audit_logs');
    });

    it('should define forbidden values', () => {
      expect(SEVERITY_RULES.forbiddenValues.system_alerts.severity).toContain('info');
      expect(SEVERITY_RULES.forbiddenValues.system_error_logs.severity).toContain('info');
    });
  });

  describe('DEPRECATED_COLUMNS', () => {
    it('should define deprecated columns', () => {
      expect(DEPRECATED_COLUMNS.address).toBeDefined();
      expect(DEPRECATED_COLUMNS.address.tables).toContain('properties');
      expect(DEPRECATED_COLUMNS.address.correctName).toBe('location');
    });

    it('should define property_type as deprecated', () => {
      expect(DEPRECATED_COLUMNS.property_type).toBeDefined();
      expect(DEPRECATED_COLUMNS.property_type.correctName).toBe('type');
    });
  });

  describe('TABLE_COLUMNS', () => {
    it('should define columns for properties table', () => {
      expect(TABLE_COLUMNS.properties).toBeDefined();
      expect(TABLE_COLUMNS.properties).toContain('location');
      expect(TABLE_COLUMNS.properties).toContain('type');
    });

    it('should NOT include deprecated columns in properties', () => {
      // address is deprecated, should use location
      expect(TABLE_COLUMNS.properties).not.toContain('address');
    });

    it('should define columns for beneficiaries table', () => {
      expect(TABLE_COLUMNS.beneficiaries).toBeDefined();
      expect(TABLE_COLUMNS.beneficiaries).toContain('full_name');
      expect(TABLE_COLUMNS.beneficiaries).toContain('national_id');
    });

    it('should define columns for contracts table', () => {
      expect(TABLE_COLUMNS.contracts).toBeDefined();
      expect(TABLE_COLUMNS.contracts).toContain('contract_number');
      expect(TABLE_COLUMNS.contracts).toContain('property_id');
    });
  });

  describe('COLUMN_RULES', () => {
    it('should have forbidden columns defined', () => {
      expect(COLUMN_RULES.forbiddenColumns).toBeDefined();
      expect(COLUMN_RULES.forbiddenColumns.properties).toContain('address');
      expect(COLUMN_RULES.forbiddenColumns.properties).toContain('property_type');
    });

    it('should have corrections defined', () => {
      expect(COLUMN_RULES.corrections).toBeDefined();
      expect(COLUMN_RULES.corrections.properties.address).toBe('location');
      expect(COLUMN_RULES.corrections.properties.property_type).toBe('type');
    });
  });

  describe('isValidColumn', () => {
    it('should return true for valid columns', () => {
      expect(isValidColumn('properties', 'location')).toBe(true);
      expect(isValidColumn('properties', 'type')).toBe(true);
      expect(isValidColumn('beneficiaries', 'full_name')).toBe(true);
    });

    it('should return false for invalid columns', () => {
      expect(isValidColumn('properties', 'nonexistent_column')).toBe(false);
    });
  });

  describe('getCorrectColumnName', () => {
    it('should return correct column name for deprecated columns', () => {
      expect(getCorrectColumnName('properties', 'address')).toBe('location');
      expect(getCorrectColumnName('properties', 'property_type')).toBe('type');
    });

    it('should return null for non-deprecated columns', () => {
      expect(getCorrectColumnName('properties', 'location')).toBeNull();
      expect(getCorrectColumnName('properties', 'status')).toBeNull();
    });

    it('should return null for unknown tables', () => {
      expect(getCorrectColumnName('unknown_table', 'address')).toBeNull();
    });
  });
});
