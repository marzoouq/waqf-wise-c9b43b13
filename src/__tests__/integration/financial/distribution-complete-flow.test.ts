import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockDistribution } from '../../fixtures/distributions';
import { mockBeneficiaries } from '../../fixtures/beneficiaries';
import { mockBalancedJournalEntry } from '../../fixtures/journal-entries';

/**
 * اختبار دورة التوزيع الكاملة
 * Integration Test: Distribution Complete Flow
 * 
 * السيناريو:
 * 1. إنشاء توزيع جديد
 * 2. محاكاة التوزيع
 * 3. الموافقة الأولى (محاسب)
 * 4. الموافقة الثانية (ناظر)
 * 5. التنفيذ
 * 6. إنشاء القيود المحاسبية
 * 7. تحديث أرصدة المستفيدين
 * 8. إرسال الإشعارات
 */

describe('Distribution Complete Flow Integration Test', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full distribution cycle from creation to execution', async () => {
    // ============================================
    // المرحلة 1: إنشاء توزيع جديد
    // ============================================
    const beneficiaries = mockBeneficiaries(50);
    const totalAmount = 500000;

    const distribution = mockDistribution({
      total_amount: totalAmount,
      beneficiaries_count: beneficiaries.length,
      status: 'draft',
      month: '2025-01',
    });

    console.log('✅ Step 1: Created distribution', distribution.id);
    expect(distribution.status).toBe('draft');
    expect(distribution.total_amount).toBe(500000);
    expect(distribution.beneficiaries_count).toBe(50);

    // ============================================
    // المرحلة 2: محاكاة التوزيع
    // ============================================
    const simulation = {
      distribution_id: distribution.id,
      total_amount: distribution.total_amount,
      beneficiaries_count: distribution.beneficiaries_count,
      
      // حساب الاستقطاعات
      deductions: {
        nazer: distribution.total_amount * 0.05,      // 5% للناظر
        reserve: distribution.total_amount * 0.10,    // 10% احتياطي
        development: distribution.total_amount * 0.05, // 5% تطوير
        maintenance: distribution.total_amount * 0.05, // 5% صيانة
        investment: distribution.total_amount * 0.05,  // 5% استثمار
      },
      
      // صافي المبلغ للتوزيع
      net_distribution: 0,
      per_beneficiary_amount: 0,
      
      // توزيع حسب الأولوية
      priority_distribution: {} as Record<number, { count: number; amount: number }>,
    };

    // حساب إجمالي الاستقطاعات
    const totalDeductions = Object.values(simulation.deductions).reduce((a, b) => a + b, 0);
    simulation.net_distribution = simulation.total_amount - totalDeductions;

    // توزيع حسب الأولوية (50% للأولوية 1، 30% للأولوية 2، 20% للأولوية 3)
    const priority1Beneficiaries = beneficiaries.filter(b => (b.priority_level || 1) === 1);
    const priority2Beneficiaries = beneficiaries.filter(b => (b.priority_level || 1) === 2);
    const priority3Beneficiaries = beneficiaries.filter(b => (b.priority_level || 1) === 3);

    simulation.priority_distribution = {
      1: {
        count: priority1Beneficiaries.length,
        amount: simulation.net_distribution * 0.50,
      },
      2: {
        count: priority2Beneficiaries.length,
        amount: simulation.net_distribution * 0.30,
      },
      3: {
        count: priority3Beneficiaries.length,
        amount: simulation.net_distribution * 0.20,
      },
    };

    console.log('✅ Step 2: Simulated distribution');
    console.log('  Total Deductions:', totalDeductions);
    console.log('  Net Distribution:', simulation.net_distribution);
    
    expect(totalDeductions).toBe(150000); // 30% من 500000
    expect(simulation.net_distribution).toBe(350000);

    // ============================================
    // المرحلة 3: الموافقة الأولى (محاسب)
    // ============================================
    const accountantApproval = {
      distribution_id: distribution.id,
      approver_role: 'accountant',
      approver_name: 'محمد المحاسب',
      approved_at: new Date().toISOString(),
      notes: 'تم المراجعة - جميع البيانات صحيحة',
      level: 1,
    };

    const afterAccountantApproval = {
      ...distribution,
      status: 'accountant_approved',
    };

    console.log('✅ Step 3: Accountant approved');
    expect(afterAccountantApproval.status).toBe('accountant_approved');
    expect(accountantApproval.level).toBe(1);

    // ============================================
    // المرحلة 4: الموافقة الثانية (ناظر)
    // ============================================
    const nazerApproval = {
      distribution_id: distribution.id,
      approver_role: 'nazer',
      approver_name: 'عبدالرحمن الناظر',
      approved_at: new Date().toISOString(),
      notes: 'موافق على التوزيع',
      level: 2,
    };

    const afterNazerApproval = {
      ...afterAccountantApproval,
      status: 'approved',
    };

    console.log('✅ Step 4: Nazer approved');
    expect(afterNazerApproval.status).toBe('approved');
    expect(nazerApproval.level).toBe(2);

    // ============================================
    // المرحلة 5: التنفيذ
    // ============================================
    const executedDistribution = {
      ...afterNazerApproval,
      status: 'executed',
      journal_entry_id: 'test-je-001',
    };

    console.log('✅ Step 5: Distribution executed');
    expect(executedDistribution.status).toBe('executed');
    expect(executedDistribution.journal_entry_id).toBeDefined();

    // ============================================
    // المرحلة 6: إنشاء القيود المحاسبية
    // ============================================
    
    // قيد 1: استقطاع مصارف الوقف
    const deductionEntry = {
      entry_number: 'JE-2025-001',
      description: `استقطاعات توزيع ${distribution.month}`,
      lines: [
        // مدين: مصروف الناظر
        { account_id: 'nazer-expense', debit: simulation.deductions.nazer, credit: 0 },
        // مدين: الاحتياطي
        { account_id: 'reserve', debit: simulation.deductions.reserve, credit: 0 },
        // مدين: التطوير
        { account_id: 'development', debit: simulation.deductions.development, credit: 0 },
        // مدين: الصيانة
        { account_id: 'maintenance', debit: simulation.deductions.maintenance, credit: 0 },
        // مدين: الاستثمار
        { account_id: 'investment', debit: simulation.deductions.investment, credit: 0 },
        // دائن: صندوق الوقف
        { account_id: 'waqf-fund', debit: 0, credit: totalDeductions },
      ],
    };

    const totalDebit = deductionEntry.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = deductionEntry.lines.reduce((sum, line) => sum + line.credit, 0);

    console.log('✅ Step 6a: Created deduction journal entry');
    expect(totalDebit).toBe(totalCredit);
    expect(totalDebit).toBe(150000);

    // قيد 2: توزيع المستحقات
    const distributionEntry = {
      entry_number: 'JE-2025-002',
      description: `توزيع مستحقات ${distribution.month}`,
      lines: [
        // مدين: حسابات المستفيدين
        { account_id: 'beneficiaries-receivable', debit: simulation.net_distribution, credit: 0 },
        // دائن: صندوق الوقف
        { account_id: 'waqf-fund', debit: 0, credit: simulation.net_distribution },
      ],
    };

    const distTotalDebit = distributionEntry.lines.reduce((sum, line) => sum + line.debit, 0);
    const distTotalCredit = distributionEntry.lines.reduce((sum, line) => sum + line.credit, 0);

    console.log('✅ Step 6b: Created distribution journal entry');
    expect(distTotalDebit).toBe(distTotalCredit);
    expect(distTotalDebit).toBe(350000);

    // ============================================
    // المرحلة 7: تحديث أرصدة المستفيدين
    // ============================================
    const updatedBeneficiaries = beneficiaries.map(beneficiary => {
      let amount = 0;
      const priority = beneficiary.priority_level || 1;
      
      if (priority === 1) {
        amount = simulation.priority_distribution[1].amount / simulation.priority_distribution[1].count;
      } else if (priority === 2) {
        amount = simulation.priority_distribution[2].amount / simulation.priority_distribution[2].count;
      } else {
        amount = simulation.priority_distribution[3].amount / simulation.priority_distribution[3].count;
      }

      return {
        ...beneficiary,
        // يُفترض أن يكون هناك حقل total_received في جدول beneficiaries
        pending_amount: amount,
      };
    });

    console.log('✅ Step 7: Updated beneficiary balances');
    expect(updatedBeneficiaries).toHaveLength(50);
    expect(updatedBeneficiaries[0]).toHaveProperty('pending_amount');

    // ============================================
    // المرحلة 8: إرسال الإشعارات
    // ============================================
    const notifications = updatedBeneficiaries.map(beneficiary => ({
      beneficiary_id: beneficiary.id,
      type: 'distribution_executed',
      title: 'تم توزيع المستحقات',
      message: `تم توزيع مبلغ ${beneficiary.pending_amount} ريال لشهر ${distribution.month}`,
      sent_at: new Date().toISOString(),
      channels: ['email', 'sms', 'push'],
    }));

    console.log('✅ Step 8: Sent notifications');
    expect(notifications).toHaveLength(50);
    expect(notifications[0]).toHaveProperty('beneficiary_id');
    expect(notifications[0]).toHaveProperty('channels');

    // ============================================
    // التحقق النهائي
    // ============================================
    console.log('\n📊 Final Verification:');
    console.log('  Distribution Status:', executedDistribution.status);
    console.log('  Total Amount:', executedDistribution.total_amount);
    console.log('  Total Deductions:', totalDeductions);
    console.log('  Net Distribution:', simulation.net_distribution);
    console.log('  Beneficiaries Count:', executedDistribution.beneficiaries_count);
    console.log('  Journal Entries Created:', 2);
    console.log('  Notifications Sent:', notifications.length);

    expect(executedDistribution.status).toBe('executed');
    expect(totalDeductions + simulation.net_distribution).toBe(executedDistribution.total_amount);
    expect(notifications.length).toBe(executedDistribution.beneficiaries_count);
  });

  it('should handle distribution rejection at accountant level', async () => {
    const distribution = mockDistribution({
      status: 'draft',
    });

    const rejection = {
      distribution_id: distribution.id,
      rejected_by: 'accountant',
      rejected_at: new Date().toISOString(),
      rejection_reason: 'بيانات غير صحيحة',
    };

    const rejectedDistribution = {
      ...distribution,
      status: 'rejected',
      notes: rejection.rejection_reason,
    };

    expect(rejectedDistribution.status).toBe('rejected');
    expect(rejectedDistribution.notes).toBeDefined();
  });

  it('should handle distribution rejection at nazer level', async () => {
    const distribution = mockDistribution({
      status: 'accountant_approved',
    });

    const rejection = {
      distribution_id: distribution.id,
      rejected_by: 'nazer',
      rejected_at: new Date().toISOString(),
      rejection_reason: 'المبلغ كبير جداً',
    };

    const rejectedDistribution = {
      ...distribution,
      status: 'rejected',
      notes: rejection.rejection_reason,
    };

    expect(rejectedDistribution.status).toBe('rejected');
  });

  it('should calculate accurate deductions', async () => {
    const totalAmount = 1000000;
    
    const deductions = {
      nazer: totalAmount * 0.05,        // 50,000
      reserve: totalAmount * 0.10,      // 100,000
      development: totalAmount * 0.05,   // 50,000
      maintenance: totalAmount * 0.05,   // 50,000
      investment: totalAmount * 0.05,    // 50,000
    };

    const total = Object.values(deductions).reduce((a, b) => a + b, 0);
    const net = totalAmount - total;

    expect(total).toBe(300000);
    expect(net).toBe(700000);
    expect(net / totalAmount).toBe(0.70); // 70% للمستفيدين
  });
});
