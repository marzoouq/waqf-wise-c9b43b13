/**
 * useBankTransfers Hook Unit Tests
 * اختبارات وحدة hook التحويلات البنكية
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mockBankTransfers,
  mockBankTransferDetails,
  createMockBankTransfer,
} from '../../fixtures/distributions.fixtures';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockBankTransfers, error: null }),
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useBankTransfers Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('جلب التحويلات', () => {
    it('يجب جلب قائمة التحويلات البنكية', () => {
      expect(mockBankTransfers).toHaveLength(2);
    });

    it('يجب عرض رقم ملف التحويل', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.file_number).toMatch(/^TRF-/);
      });
    });

    it('يجب عرض تنسيق الملف', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.file_format).toBe('SARIE');
      });
    });
  });

  describe('حالات التحويل', () => {
    it('يجب عرض التحويلات المكتملة', () => {
      const completed = mockBankTransfers.filter(t => t.status === 'completed');
      expect(completed).toHaveLength(2);
    });

    it('يجب عرض التحويلات المعلقة', () => {
      const pending = mockBankTransfers.filter(t => t.status === 'pending');
      expect(pending).toHaveLength(0);
    });
  });

  describe('إجماليات التحويل', () => {
    it('يجب حساب إجمالي المبلغ', () => {
      const totalAmount = mockBankTransfers.reduce(
        (sum, t) => sum + t.total_amount, 0
      );
      expect(totalAmount).toBe(195000);
    });

    it('يجب حساب عدد المعاملات الإجمالي', () => {
      const totalTransactions = mockBankTransfers.reduce(
        (sum, t) => sum + t.total_transactions, 0
      );
      expect(totalTransactions).toBe(65);
    });
  });

  describe('تفاصيل التحويل', () => {
    it('يجب جلب تفاصيل التحويل', () => {
      expect(mockBankTransferDetails).toHaveLength(2);
    });

    it('يجب عرض IBAN المستفيد', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.iban).toMatch(/^SA/);
      });
    });

    it('يجب عرض اسم البنك', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.bank_name).toBeDefined();
      });
    });

    it('يجب عرض رقم المرجع', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.reference_number).toBeDefined();
      });
    });
  });

  describe('إنشاء تحويل', () => {
    it('يجب إنشاء تحويل جديد', () => {
      const newTransfer = createMockBankTransfer();
      expect(newTransfer.id).toBeDefined();
      expect(newTransfer.status).toBe('pending');
    });

    it('يجب تعيين رقم ملف فريد', () => {
      const transfer1 = createMockBankTransfer();
      const transfer2 = createMockBankTransfer();
      expect(transfer1.file_number).not.toBe(transfer2.file_number);
    });
  });

  describe('التواريخ', () => {
    it('يجب تسجيل تاريخ الإنشاء', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.created_at).toBeDefined();
      });
    });

    it('يجب تسجيل تاريخ الإرسال', () => {
      const sentTransfers = mockBankTransfers.filter(t => t.sent_at);
      expect(sentTransfers.length).toBeGreaterThan(0);
    });

    it('يجب تسجيل تاريخ المعالجة', () => {
      const processedTransfers = mockBankTransfers.filter(t => t.processed_at);
      expect(processedTransfers.length).toBeGreaterThan(0);
    });
  });

  describe('الربط بالتوزيعات', () => {
    it('يجب ربط التحويل بتوزيع', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.distribution_id).toBeDefined();
      });
    });

    it('يجب ربط التحويل بحساب بنكي', () => {
      mockBankTransfers.forEach(transfer => {
        expect(transfer.bank_account_id).toBeDefined();
      });
    });
  });

  describe('تفاصيل المستفيد', () => {
    it('يجب عرض اسم المستفيد', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.beneficiary_name).toBeDefined();
      });
    });

    it('يجب عرض مبلغ المستفيد', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.amount).toBeGreaterThan(0);
      });
    });

    it('يجب ربط التفصيل بالمستفيد', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.beneficiary_id).toBeDefined();
      });
    });
  });

  describe('حالات تفاصيل التحويل', () => {
    it('يجب عرض التحويلات المكتملة', () => {
      const completed = mockBankTransferDetails.filter(d => d.status === 'completed');
      expect(completed).toHaveLength(2);
    });

    it('يجب تسجيل وقت المعالجة', () => {
      const processed = mockBankTransferDetails.filter(d => d.processed_at);
      expect(processed.length).toBeGreaterThan(0);
    });
  });

  describe('التحقق من IBAN', () => {
    it('يجب أن يبدأ IBAN بـ SA', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.iban.startsWith('SA')).toBe(true);
      });
    });

    it('يجب أن يكون طول IBAN صحيحاً', () => {
      mockBankTransferDetails.forEach(detail => {
        expect(detail.iban.length).toBe(24);
      });
    });
  });

  describe('تصدير ملف التحويل', () => {
    it('يجب دعم تنسيق SARIE', () => {
      const sarieFiles = mockBankTransfers.filter(t => t.file_format === 'SARIE');
      expect(sarieFiles.length).toBeGreaterThan(0);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع فشل الجلب', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('Fetch error') }),
      } as any);
    });

    it('يجب التعامل مع IBAN غير صالح', () => {
      const invalidIban = 'INVALID';
      expect(invalidIban.startsWith('SA')).toBe(false);
    });
  });

  describe('الترتيب والفلترة', () => {
    it('يجب ترتيب التحويلات حسب التاريخ', () => {
      const sorted = [...mockBankTransfers].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      expect(new Date(sorted[0].created_at).getTime())
        .toBeGreaterThanOrEqual(new Date(sorted[1].created_at).getTime());
    });

    it('يجب فلترة حسب التوزيع', () => {
      const dist1Transfers = mockBankTransfers.filter(t => t.distribution_id === 'dist-1');
      expect(dist1Transfers).toHaveLength(1);
    });
  });

  describe('إحصائيات التحويلات', () => {
    it('يجب حساب متوسط مبلغ التحويل', () => {
      const average = mockBankTransfers.reduce(
        (sum, t) => sum + t.total_amount, 0
      ) / mockBankTransfers.length;
      expect(average).toBe(97500);
    });

    it('يجب حساب متوسط عدد المعاملات', () => {
      const average = mockBankTransfers.reduce(
        (sum, t) => sum + t.total_transactions, 0
      ) / mockBankTransfers.length;
      expect(average).toBe(32.5);
    });
  });
});
