/**
 * Hook لإدارة مستندات الإفصاح السنوي
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    queryFn: async () => {
      if (!disclosureId) return [];
      
      const { data, error } = await supabase
        .from("disclosure_documents")
        .select("*")
        .eq("disclosure_id", disclosureId)
        .order("document_type", { ascending: true });
      
      if (error) throw error;
      return data as DisclosureDocument[];
    },
    enabled: !!disclosureId,
  });

  // تجميع المستندات حسب النوع
  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.document_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, DisclosureDocument[]>);

  return {
    documents,
    groupedDocuments,
    isLoading,
    getTypeLabel: (type: string) => DOCUMENT_TYPE_LABELS[type] || type,
  };
}
