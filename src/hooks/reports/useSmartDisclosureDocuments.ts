/**
 * Hook لإدارة مستندات الإفصاح السنوي مع المحتوى المستخرج
 * @version 2.8.65
 */
import { useQuery } from "@tanstack/react-query";
import { DisclosureService, SmartDisclosureDocument } from "@/services/disclosure.service";

export type { SmartDisclosureDocument };

export interface CategorySummary {
  type: string;
  label: string;
  count: number;
  totalAmount: number;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'فاتورة_خدمات': 'فواتير خدمات',
  'صيانة': 'صيانة',
  'زكاة_ضرائب': 'زكاة وضرائب',
  'تقرير_مالي': 'تقارير مالية',
  'خدمات_محاسبية': 'خدمات محاسبية',
  'مصاريف_عامة': 'مصاريف عامة',
  'اقفال_سنوي': 'إقفال سنوي',
};

export function useSmartDisclosureDocuments(disclosureId?: string) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["smart-disclosure-documents", disclosureId],
    queryFn: () => DisclosureService.getSmartDocuments(disclosureId!),
    enabled: !!disclosureId,
  });

  // حساب ملخص الفئات
  const categorySummary: CategorySummary[] = Object.entries(
    documents.reduce((acc, doc) => {
      const type = doc.document_type;
      if (!acc[type]) {
        acc[type] = {
          type,
          label: DOCUMENT_TYPE_LABELS[type] || type,
          count: 0,
          totalAmount: 0,
        };
      }
      acc[type].count += 1;
      acc[type].totalAmount += doc.total_amount || 0;
      return acc;
    }, {} as Record<string, CategorySummary>)
  ).map(([, value]) => value);

  return {
    documents,
    categorySummary,
    isLoading,
    getTypeLabel: (type: string) => DOCUMENT_TYPE_LABELS[type] || type,
  };
}
