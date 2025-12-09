/**
 * Query Invalidation Helper - مساعد إبطال الاستعلامات
 * @version 1.0.0
 * 
 * توحيد إبطال الكاش بدلاً من استدعاءات متعددة
 */

import { QueryClient } from "@tanstack/react-query";

/**
 * إبطال مجموعات الاستعلامات المتعلقة
 * بدلاً من استدعاء invalidateQueries 5-6 مرات
 */
export function invalidateQueryGroups(
  queryClient: QueryClient,
  groups: ('accounting' | 'beneficiaries' | 'properties' | 'payments' | 'approvals' | 'dashboard' | 'fiscal')[]
) {
  const patterns: string[] = [];

  groups.forEach(group => {
    switch (group) {
      case 'accounting':
        patterns.push('journal', 'accounts', 'trial-balance', 'balance-sheet', 'income-statement', 'cash-flow', 'budgets');
        break;
      case 'beneficiaries':
        patterns.push('beneficiar', 'heir', 'family', 'families');
        break;
      case 'properties':
        patterns.push('propert', 'contract', 'tenant', 'rental', 'maintenance', 'unit');
        break;
      case 'payments':
        patterns.push('payment', 'voucher', 'bank', 'invoice');
        break;
      case 'approvals':
        patterns.push('approval', 'pending');
        break;
      case 'dashboard':
        patterns.push('kpi', 'stats', 'unified-dashboard');
        break;
      case 'fiscal':
        patterns.push('fiscal');
        break;
    }
  });

  // إبطال واحد باستخدام predicate بدلاً من 5-6 استدعاءات
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return patterns.some(pattern => key.toLowerCase().includes(pattern));
    }
  });
}

/**
 * إبطال استعلامات المحاسبة
 */
export function invalidateAccountingQueries(queryClient: QueryClient) {
  invalidateQueryGroups(queryClient, ['accounting', 'approvals', 'dashboard']);
}

/**
 * إبطال استعلامات المستفيدين
 */
export function invalidateBeneficiaryQueries(queryClient: QueryClient) {
  invalidateQueryGroups(queryClient, ['beneficiaries', 'payments', 'dashboard']);
}

/**
 * إبطال استعلامات العقارات
 */
export function invalidatePropertyQueries(queryClient: QueryClient) {
  invalidateQueryGroups(queryClient, ['properties', 'payments', 'dashboard']);
}

/**
 * إبطال استعلامات التوزيعات
 */
export function invalidateDistributionQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return key.includes('distribution') || 
             key.includes('heir') || 
             key.includes('beneficiar') ||
             key.includes('kpi') ||
             key.includes('fiscal');
    }
  });
}

/**
 * إبطال استعلامات القروض
 */
export function invalidateLoanQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return key.includes('loan') || 
             key.includes('emergency') ||
             key.includes('approval') ||
             key.includes('beneficiar');
    }
  });
}

/**
 * إبطال استعلامات الإعدادات
 */
export function invalidateSettingsQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return key.includes('setting') || 
             key.includes('config') ||
             key.includes('template');
    }
  });
}

/**
 * إبطال استعلامات المستخدمين
 */
export function invalidateUserQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey[0];
      if (typeof key !== 'string') return false;
      return key.includes('user') || 
             key.includes('profile') ||
             key.includes('role') ||
             key.includes('permission');
    }
  });
}
