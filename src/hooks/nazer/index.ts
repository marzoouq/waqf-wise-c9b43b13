/**
 * Nazer Hooks
 * @version 2.8.44 - إضافة تصديرات مفقودة
 */

export { 
  useBeneficiaryActivitySessions, 
  getPageName,
  type BeneficiarySession 
} from './useBeneficiaryActivitySessions';

export { 
  useDistributeRevenue,
  type HeirShare 
} from './useDistributeRevenue';

export { usePublishFiscalYear } from './usePublishFiscalYear';

// ✅ إضافة التصديرات المفقودة
export { useNazerBeneficiariesQuick, type NazerBeneficiary } from './useNazerBeneficiariesQuick';
export { useWaqfBranding, type WaqfBranding } from './useWaqfBranding';
