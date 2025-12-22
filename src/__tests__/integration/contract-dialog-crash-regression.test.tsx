import React from 'react';
import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { ContractDialog } from '@/components/properties/ContractDialog';

// منع ضوضاء console.error داخل الاختبار
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

vi.mock('@/hooks/ui/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/hooks/property/useContracts', () => ({
  useContracts: () => ({
    addContract: { mutateAsync: vi.fn() },
    updateContract: { mutateAsync: vi.fn() },
  }),
}));

vi.mock('@/hooks/property/useProperties', () => ({
  useProperties: () => ({
    properties: [
      {
        id: 'p1',
        name: 'عقار تجريبي',
        type: 'سكني',
        location: 'الرياض',
        units: 10,
        occupied: 3,
        monthly_revenue: 10000,
        status: 'نشط',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  }),
}));

vi.mock('@/hooks/property/usePropertyUnits', () => ({
  usePropertyUnits: () => ({
    units: [
      {
        id: 'u1',
        unit_number: '101',
        unit_type: 'شقة',
        status: 'متاح',
        area: 120,
        floor: 1,
        property_id: 'p1',
      },
    ],
    isLoading: false,
  }),
}));

vi.mock('@/hooks/property/useTenants', () => ({
  useTenants: () => ({
    tenants: [],
    addTenant: vi.fn(),
    isAdding: false,
  }),
}));

// نجعل بيانات النموذج صالحة بالكامل لتجاوز التحقق، مع وحدة مختارة مسبقاً
vi.mock('@/components/properties/contract/useContractForm', () => ({
  useContractForm: () => ({
    formData: {
      contract_number: 'C-TEST-1',
      property_id: 'p1',
      contract_type: 'إيجار',
      tenant_id: null,
      tenant_name: 'مستأجر تجريبي',
      tenant_id_number: '1234567890',
      tenant_phone: '0500000000',
      tenant_email: 'test@example.com',
      start_date: '2025-01-01',
      end_date: '2026-01-01',
      monthly_rent: '1000',
      total_amount: '12000',
      payment_frequency: 'شهري',
      security_deposit: '0',
      is_tax_exempt: true,
      tax_percentage: '0',
      is_renewable: false,
      auto_renew: false,
      renewal_notice_days: '30',
      terms_and_conditions: '',
      notes: '',
    },
    updateFormData: vi.fn(),
    contractDuration: 12,
    setContractDuration: vi.fn(),
    durationUnit: 'أشهر',
    setDurationUnit: vi.fn(),
    totalAmount: '12000',
    setTotalAmount: vi.fn(),
    selectedPropertyId: 'p1',
    setSelectedPropertyId: vi.fn(),
    selectedUnits: ['u1'],
    setSelectedUnits: vi.fn(),
    toggleUnit: vi.fn(),
    resetForm: vi.fn(),
  }),
}));

describe('Regression: Contract dialog should not crash properties page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not trigger PageErrorBoundary when contract save fails after linking a unit', async () => {
    const user = userEvent.setup();

    const onOpenChange = vi.fn();

    // اجعل حفظ العقد يفشل (هذا هو السيناريو الذي كان يسبب انكسار الصفحة)
    const { useContracts } = await import('@/hooks/property/useContracts');
    const contracts = useContracts();
    (contracts.addContract.mutateAsync as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('Simulated backend error')
    );

    render(
      <PageErrorBoundary pageName="العقارات">
        <ContractDialog open={true} onOpenChange={onOpenChange} contract={null} />
      </PageErrorBoundary>
    );

    // زر الحفظ
    await user.click(screen.getByRole('button', { name: 'إضافة' }));

    await waitFor(() => {
      expect(contracts.addContract.mutateAsync).toHaveBeenCalled();
    });

    // يجب ألا يُغلق الحوار (لا يوجد onOpenChange(false))
    expect(onOpenChange).not.toHaveBeenCalled();

    // الأهم: لا يجب أن تظهر شاشة "خطأ في تحميل الصفحة" الخاصة بـ PageErrorBoundary
    expect(screen.queryByText('خطأ في تحميل الصفحة')).not.toBeInTheDocument();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });
});

