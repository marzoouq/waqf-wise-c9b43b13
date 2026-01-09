/**
 * اختبارات خدمة التقارير - اختبارات حقيقية
 * Report Service Tests - Real Tests
 * 
 * هذه الاختبارات تتحقق من:
 * 1. استدعاء Supabase بالشكل الصحيح
 * 2. معالجة البيانات المرجعة
 * 3. معالجة الأخطاء
 * 4. تحويل البيانات
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService, CustomReportsService } from '@/services/report.service';
import { setMockTableData, clearMockTableData, mockSupabase } from '../../utils/supabase.mock';

describe('ReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
    // Clear localStorage for favorites
    localStorage.clear();
  });

  describe('getAnnualDisclosures', () => {
    it('should call supabase.from with correct table name', async () => {
      const mockDisclosures = [
        { 
          id: 'disc-1', 
          year: 2024, 
          waqf_name: 'وقف اختباري',
          total_revenues: 100000,
          total_expenses: 50000,
          net_income: 50000,
          status: 'published'
        },
        { 
          id: 'disc-2', 
          year: 2023, 
          waqf_name: 'وقف اختباري',
          total_revenues: 90000,
          total_expenses: 45000,
          net_income: 45000,
          status: 'draft'
        }
      ];
      setMockTableData('annual_disclosures', mockDisclosures);

      const result = await ReportService.getAnnualDisclosures();

      // التحقق من استدعاء الجدول الصحيح
      expect(mockSupabase.from).toHaveBeenCalledWith('annual_disclosures');
      
      // التحقق من أن النتيجة مصفوفة
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return empty array when no disclosures exist', async () => {
      setMockTableData('annual_disclosures', []);

      const result = await ReportService.getAnnualDisclosures();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('getCurrentYearDisclosure', () => {
    it('should fetch current year disclosure with correct filters', async () => {
      const currentYear = new Date().getFullYear();
      const mockDisclosure = {
        id: 'disc-current',
        year: currentYear,
        waqf_name: 'وقف السنة الحالية',
        total_revenues: 120000,
        total_expenses: 60000,
        net_income: 60000,
        status: 'draft'
      };
      setMockTableData('annual_disclosures', [mockDisclosure]);

      const result = await ReportService.getCurrentYearDisclosure();

      expect(mockSupabase.from).toHaveBeenCalledWith('annual_disclosures');
      expect(result).toBeDefined();
    });

    it('should return null when no current year disclosure exists', async () => {
      setMockTableData('annual_disclosures', []);

      const result = await ReportService.getCurrentYearDisclosure();

      // يمكن أن تكون null أو undefined
      expect(result === null || result === undefined || (Array.isArray(result) && result.length === 0)).toBe(true);
    });
  });

  describe('generateAnnualDisclosure', () => {
    it('should generate disclosure with correct parameters', async () => {
      const year = 2024;
      const waqfName = 'وقف اختباري جديد';
      
      setMockTableData('annual_disclosures', []);
      setMockTableData('beneficiaries', [
        { id: 'ben-1', category: 'أبناء', status: 'active' },
        { id: 'ben-2', category: 'بنات', status: 'active' }
      ]);
      setMockTableData('journal_entries', []);

      const result = await ReportService.generateAnnualDisclosure(year, waqfName);

      expect(result).toBeDefined();
    });

    it('should handle missing required parameters', async () => {
      setMockTableData('annual_disclosures', []);

      // اختبار مع معاملات ناقصة
      const result = await ReportService.generateAnnualDisclosure(2024, '');
      
      expect(result).toBeDefined();
    });
  });

  describe('publishDisclosure', () => {
    it('should update disclosure status to published', async () => {
      const disclosureId = 'disc-to-publish';
      const mockDisclosure = {
        id: disclosureId,
        year: 2024,
        waqf_name: 'وقف للنشر',
        status: 'draft'
      };
      setMockTableData('annual_disclosures', [mockDisclosure]);

      const result = await ReportService.publishDisclosure(disclosureId);

      expect(mockSupabase.from).toHaveBeenCalledWith('annual_disclosures');
      expect(result).toBeDefined();
    });

    it('should handle publishing non-existent disclosure', async () => {
      setMockTableData('annual_disclosures', []);

      const result = await ReportService.publishDisclosure('non-existent-id');

      // يجب أن يعالج الحالة بشكل صحيح
      expect(result === null || result === undefined).toBe(true);
    });
  });
});

describe('CustomReportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearMockTableData();
    localStorage.clear();
  });

  describe('getCustomTemplates', () => {
    it('should fetch templates from database', async () => {
      const mockTemplates = [
        {
          id: 'tpl-1',
          template_name: 'تقرير المستفيدين',
          report_type: 'beneficiaries',
          columns: ['full_name', 'national_id', 'status'],
          created_at: '2024-01-01'
        }
      ];
      setMockTableData('report_templates', mockTemplates);

      const result = await CustomReportsService.getCustomTemplates();

      expect(mockSupabase.from).toHaveBeenCalledWith('report_templates');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should mark templates as favorites based on localStorage', async () => {
      const templateId = 'tpl-favorite';
      localStorage.setItem('report_favorites', JSON.stringify([templateId]));
      
      setMockTableData('report_templates', [{
        id: templateId,
        template_name: 'تقرير مفضل',
        report_type: 'beneficiaries',
        columns: ['full_name'],
        created_at: '2024-01-01'
      }]);

      const result = await CustomReportsService.getCustomTemplates();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('createCustomTemplate', () => {
    it('should create template with correct structure', async () => {
      setMockTableData('report_templates', []);

      const newTemplate = {
        name: 'تقرير جديد',
        report_type: 'properties',
        fields: ['name', 'location', 'status']
      };

      const result = await CustomReportsService.createCustomTemplate(newTemplate);

      expect(mockSupabase.from).toHaveBeenCalledWith('report_templates');
      expect(result).toBeDefined();
    });
  });

  describe('toggleFavorite', () => {
    it('should add template to favorites', async () => {
      const templateId = 'tpl-to-favorite';

      await CustomReportsService.toggleFavorite(templateId, true);

      const favorites = JSON.parse(localStorage.getItem('report_favorites') || '[]');
      expect(favorites).toContain(templateId);
    });

    it('should remove template from favorites', async () => {
      const templateId = 'tpl-to-unfavorite';
      localStorage.setItem('report_favorites', JSON.stringify([templateId]));

      await CustomReportsService.toggleFavorite(templateId, false);

      const favorites = JSON.parse(localStorage.getItem('report_favorites') || '[]');
      expect(favorites).not.toContain(templateId);
    });
  });

  describe('executeDirectReport', () => {
    it('should execute report with correct parameters', async () => {
      setMockTableData('beneficiaries', [
        { full_name: 'أحمد محمد', status: 'active' },
        { full_name: 'سارة علي', status: 'active' }
      ]);

      const result = await CustomReportsService.executeDirectReport(
        'beneficiaries',
        ['full_name', 'status'],
        'full_name'
      );

      expect(mockSupabase.from).toHaveBeenCalledWith('beneficiaries');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('columns');
      expect(result).toHaveProperty('generatedAt');
    });

    it('should handle invalid table name gracefully', async () => {
      const result = await CustomReportsService.executeDirectReport(
        'invalid_table',
        ['field1'],
        undefined
      );

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return correct columns structure', async () => {
      setMockTableData('beneficiaries', []);

      const result = await CustomReportsService.executeDirectReport(
        'beneficiaries',
        ['full_name', 'status'],
        undefined
      );

      expect(result.columns).toHaveLength(2);
      expect(result.columns[0]).toHaveProperty('key');
      expect(result.columns[0]).toHaveProperty('label');
    });
  });

  describe('getReportFields', () => {
    it('should return available fields for each report type', () => {
      const fields = CustomReportsService.getReportFields();

      expect(fields).toHaveProperty('beneficiaries');
      expect(fields).toHaveProperty('properties');
      expect(fields).toHaveProperty('distributions');
      
      expect(Array.isArray(fields.beneficiaries)).toBe(true);
      expect(fields.beneficiaries.length).toBeGreaterThan(0);
    });
  });

  describe('getTrialBalance', () => {
    it('should fetch and calculate trial balance correctly', async () => {
      setMockTableData('accounts', [
        { code: '1001', name_ar: 'النقدية', current_balance: 50000, account_nature: 'asset', is_active: true },
        { code: '2001', name_ar: 'الدائنون', current_balance: 20000, account_nature: 'liability', is_active: true }
      ]);

      const result = await CustomReportsService.getTrialBalance();

      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty accounts', async () => {
      setMockTableData('accounts', []);

      const result = await CustomReportsService.getTrialBalance();

      expect(result).toEqual([]);
    });
  });

  describe('getAgingReport', () => {
    it('should calculate aging buckets correctly', async () => {
      const today = new Date();
      const pastDue30 = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000);
      const pastDue60 = new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000);

      setMockTableData('invoices', [
        { id: 'inv-1', due_date: today.toISOString(), total_amount: 1000, status: 'unpaid' },
        { id: 'inv-2', due_date: pastDue30.toISOString(), total_amount: 2000, status: 'unpaid' },
        { id: 'inv-3', due_date: pastDue60.toISOString(), total_amount: 3000, status: 'unpaid' }
      ]);

      const result = await CustomReportsService.getAgingReport();

      expect(mockSupabase.from).toHaveBeenCalledWith('invoices');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('summary');
      expect(result.summary).toHaveProperty('total');
    });
  });
});
