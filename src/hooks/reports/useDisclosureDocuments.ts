/**
 * Hook لإدارة مستندات الإفصاح السنوي
 * @version 2.8.65
 */
import { useQuery } from "@tanstack/react-query";
import { DisclosureService } from "@/services/disclosure.service";

export interface DisclosureDocument {
  id: string;
  disclosure_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_size: number | null;
  description: string | null;
  fiscal_year: number;
  uploaded_by: string | null;
  created_at: string;
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

export function useDisclosureDocuments(disclosureId?: string) {
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["disclosure-documents", disclosureId],
    queryFn: () => DisclosureService.getDocuments(disclosureId!),
    enabled: !!disclosureId,
  });

  // تجميع المستندات حسب النوع
  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.document_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc as unknown as DisclosureDocument);
    return acc;
  }, {} as Record<string, DisclosureDocument[]>);

  return {
    documents: documents as unknown as DisclosureDocument[],
    groupedDocuments,
    isLoading,
    getTypeLabel: (type: string) => DOCUMENT_TYPE_LABELS[type] || type,
  };
}
