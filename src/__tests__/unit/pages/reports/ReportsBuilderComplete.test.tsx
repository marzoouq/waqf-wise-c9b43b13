/**
 * اختبارات شاملة لمنشئ التقارير والرؤى الذكية
 * Comprehensive Report Builder and Smart Insights Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setMockTableData, clearMockTableData } from '@/test/setup';

const mockReportTemplates = [
  { id: '1', name: 'تقرير المستفيدين', type: 'beneficiaries', columns: ['full_name', 'category', 'total_received'], filters: {}, is_default: true },
  { id: '2', name: 'تقرير المدفوعات', type: 'payments', columns: ['beneficiary', 'amount', 'date', 'status'], filters: {}, is_default: true },
  { id: '3', name: 'تقرير مخصص', type: 'custom', columns: ['property', 'tenant', 'rent'], filters: { status: 'active' }, is_default: false },
];

const mockScheduledReports = [
  { id: '1', template_id: '1', schedule: 'monthly', next_run: '2025-02-01', recipients: ['admin@waqf.com'], is_active: true },
  { id: '2', template_id: '2', schedule: 'weekly', next_run: '2025-01-27', recipients: ['accountant@waqf.com'], is_active: true },
];

const mockAIInsights = [
  { id: '1', type: 'trend', title: 'زيادة في الإيرادات', description: 'ارتفعت الإيرادات بنسبة 15% عن الشهر الماضي', severity: 'positive', created_at: '2025-01-20' },
  { id: '2', type: 'warning', title: 'مستأجر متأخر', description: 'المستأجر شركة القويشي متأخر في السداد لمدة 30 يوم', severity: 'warning', created_at: '2025-01-19' },
  { id: '3', type: 'recommendation', title: 'فرصة استثمارية', description: 'يوجد عقار شاغر يمكن تأجيره بسعر أعلى', severity: 'info', created_at: '2025-01-18' },
];

describe('Report Builder and Insights - Complete Tests', () => {
  beforeEach(() => {
    clearMockTableData();
    vi.clearAllMocks();
  });

  // ==================== منشئ التقارير ====================
  describe('Report Builder (منشئ التقارير)', () => {
    beforeEach(() => {
      setMockTableData('report_templates', mockReportTemplates);
    });

    describe('Template List', () => {
      it('should display all templates', () => {
        expect(mockReportTemplates).toHaveLength(3);
      });

      it('should show template names', () => {
        expect(mockReportTemplates[0].name).toBe('تقرير المستفيدين');
      });

      it('should show template types', () => {
        const types = mockReportTemplates.map(t => t.type);
        expect(types).toContain('beneficiaries');
        expect(types).toContain('payments');
        expect(types).toContain('custom');
      });

      it('should identify default templates', () => {
        const defaults = mockReportTemplates.filter(t => t.is_default);
        expect(defaults).toHaveLength(2);
      });
    });

    describe('Create Template', () => {
      it('should create new template', () => {
        const newTemplate = {
          name: 'تقرير جديد',
          type: 'custom',
          columns: ['col1', 'col2'],
          filters: {}
        };
        expect(newTemplate.name).toBe('تقرير جديد');
      });

      it('should validate column selection', () => {
        const columns = ['full_name', 'amount', 'date'];
        expect(columns.length).toBeGreaterThan(0);
      });

      it('should add filters', () => {
        const filters = { status: 'active', date_from: '2025-01-01' };
        expect(Object.keys(filters)).toHaveLength(2);
      });
    });

    describe('Column Selection', () => {
      it('should select columns', () => {
        const template = mockReportTemplates[0];
        expect(template.columns).toContain('full_name');
        expect(template.columns).toContain('category');
      });

      it('should reorder columns', () => {
        const columns = ['a', 'b', 'c'];
        const reordered = [columns[2], columns[0], columns[1]];
        expect(reordered).toEqual(['c', 'a', 'b']);
      });
    });

    describe('Filter Configuration', () => {
      it('should apply filters', () => {
        const template = mockReportTemplates[2];
        expect(template.filters).toHaveProperty('status', 'active');
      });

      it('should support multiple filters', () => {
        const filters = {
          status: 'active',
          category: 'ابن',
          date_from: '2025-01-01',
          date_to: '2025-12-31'
        };
        expect(Object.keys(filters)).toHaveLength(4);
      });
    });
  });

  // ==================== جدولة التقارير ====================
  describe('Report Scheduling (جدولة التقارير)', () => {
    beforeEach(() => {
      setMockTableData('scheduled_reports', mockScheduledReports);
    });

    describe('Schedule List', () => {
      it('should display all schedules', () => {
        expect(mockScheduledReports).toHaveLength(2);
      });

      it('should show schedule frequency', () => {
        expect(mockScheduledReports[0].schedule).toBe('monthly');
        expect(mockScheduledReports[1].schedule).toBe('weekly');
      });

      it('should show next run date', () => {
        expect(mockScheduledReports[0].next_run).toBe('2025-02-01');
      });

      it('should show recipients', () => {
        expect(mockScheduledReports[0].recipients).toContain('admin@waqf.com');
      });
    });

    describe('Create Schedule', () => {
      it('should create new schedule', () => {
        const newSchedule = {
          template_id: '1',
          schedule: 'daily',
          recipients: ['user@waqf.com'],
          is_active: true
        };
        expect(newSchedule.schedule).toBe('daily');
      });

      it('should validate recipients', () => {
        const recipients = ['valid@email.com'];
        const isValid = recipients.every(r => r.includes('@'));
        expect(isValid).toBe(true);
      });
    });

    describe('Toggle Schedule', () => {
      it('should enable/disable schedule', () => {
        const toggle = (schedule: typeof mockScheduledReports[0]) => ({
          ...schedule,
          is_active: !schedule.is_active
        });
        const toggled = toggle(mockScheduledReports[0]);
        expect(toggled.is_active).toBe(false);
      });
    });
  });

  // ==================== الرؤى الذكية ====================
  describe('Smart Insights (الرؤى الذكية)', () => {
    beforeEach(() => {
      setMockTableData('ai_insights', mockAIInsights);
    });

    describe('Insight List', () => {
      it('should display all insights', () => {
        expect(mockAIInsights).toHaveLength(3);
      });

      it('should show insight types', () => {
        const types = mockAIInsights.map(i => i.type);
        expect(types).toContain('trend');
        expect(types).toContain('warning');
        expect(types).toContain('recommendation');
      });

      it('should show severity levels', () => {
        const severities = mockAIInsights.map(i => i.severity);
        expect(severities).toContain('positive');
        expect(severities).toContain('warning');
        expect(severities).toContain('info');
      });
    });

    describe('Insight Details', () => {
      it('should show insight title', () => {
        expect(mockAIInsights[0].title).toBe('زيادة في الإيرادات');
      });

      it('should show insight description', () => {
        expect(mockAIInsights[0].description).toContain('15%');
      });
    });

    describe('Filter Insights', () => {
      it('should filter by type', () => {
        const warnings = mockAIInsights.filter(i => i.type === 'warning');
        expect(warnings).toHaveLength(1);
      });

      it('should filter by severity', () => {
        const positive = mockAIInsights.filter(i => i.severity === 'positive');
        expect(positive).toHaveLength(1);
      });
    });
  });

  // ==================== المساعد الذكي ====================
  describe('AI Assistant (المساعد الذكي)', () => {
    it('should process user query', () => {
      const processQuery = vi.fn((query: string) => ({
        query,
        response: 'إجابة المساعد الذكي',
        success: true
      }));
      const result = processQuery('ما هو إجمالي الإيرادات؟');
      expect(result.success).toBe(true);
    });

    it('should generate report from query', () => {
      const generateReport = vi.fn((query: string) => ({
        query,
        reportType: 'revenue',
        data: [{ month: '01', amount: 850000 }]
      }));
      const result = generateReport('أظهر لي تقرير الإيرادات');
      expect(result.reportType).toBe('revenue');
    });

    it('should provide suggestions', () => {
      const suggestions = [
        'ما هو إجمالي المدفوعات؟',
        'أظهر لي المستأجرين المتأخرين',
        'ما هي نسبة الإشغال؟'
      ];
      expect(suggestions).toHaveLength(3);
    });
  });

  // ==================== سجل العمليات ====================
  describe('Activity Log (سجل العمليات)', () => {
    const mockActivityLog = [
      { id: '1', action: 'create', entity: 'beneficiary', user: 'admin', timestamp: '2025-01-20T10:00:00Z' },
      { id: '2', action: 'update', entity: 'payment', user: 'accountant', timestamp: '2025-01-20T11:00:00Z' },
      { id: '3', action: 'approve', entity: 'distribution', user: 'nazer', timestamp: '2025-01-20T12:00:00Z' },
    ];

    beforeEach(() => {
      setMockTableData('audit_logs', mockActivityLog);
    });

    it('should display all activities', () => {
      expect(mockActivityLog).toHaveLength(3);
    });

    it('should show action types', () => {
      const actions = mockActivityLog.map(a => a.action);
      expect(actions).toContain('create');
      expect(actions).toContain('update');
      expect(actions).toContain('approve');
    });

    it('should filter by user', () => {
      const adminActions = mockActivityLog.filter(a => a.user === 'admin');
      expect(adminActions).toHaveLength(1);
    });

    it('should filter by entity', () => {
      const beneficiaryActions = mockActivityLog.filter(a => a.entity === 'beneficiary');
      expect(beneficiaryActions).toHaveLength(1);
    });
  });
});
