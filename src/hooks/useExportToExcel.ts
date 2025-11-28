import { useCallback } from "react";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { logger } from "@/lib/logger";

type AnnualDisclosure = Database['public']['Tables']['annual_disclosures']['Row'];
type DisclosureBeneficiary = Database['public']['Tables']['disclosure_beneficiaries']['Row'];

export interface ExcelExportOptions {
  filename: string;
  sheets: {
    name: string;
    data: Record<string, any>[];
  }[];
}

export function useExportToExcel() {
  const exportToExcel = useCallback(async (options: ExcelExportOptions) => {
    try {
      // Dynamic import for XLSX
      const XLSX = await import("xlsx");
      
      const workbook = XLSX.utils.book_new();

      options.sheets.forEach(sheet => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        
        // تحسين عرض الأعمدة
        const maxWidth = 20;
        const cols = Object.keys(sheet.data[0] || {}).map(() => ({ wch: maxWidth }));
        worksheet['!cols'] = cols;

        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      });

      // تصدير الملف
      XLSX.writeFile(workbook, options.filename);

      toast.success("تم التصدير بنجاح", {
        description: `تم تصدير البيانات إلى ${options.filename}`,
      });
    } catch (error) {
      logger.error(error, { 
        context: 'export_to_excel', 
        severity: 'low'
      });
      toast.error("فشل التصدير", {
        description: "حدث خطأ أثناء تصدير البيانات إلى Excel",
      });
    }
  }, []);

  return { exportToExcel };
}

// دالة مساعدة لتنسيق بيانات الإفصاح السنوي
export function formatDisclosureForExcel(disclosure: AnnualDisclosure) {
  return {
    'السنة المالية': disclosure.year,
    'اسم الوقف': disclosure.waqf_name,
    'إجمالي الإيرادات': disclosure.total_revenues?.toLocaleString() || '0',
    'إجمالي المصروفات': disclosure.total_expenses?.toLocaleString() || '0',
    'صافي الدخل': disclosure.net_income?.toLocaleString() || '0',
    'حصة الناظر': disclosure.nazer_share?.toLocaleString() || '0',
    'نسبة الناظر': `${disclosure.nazer_percentage}%`,
    'حصة البر': disclosure.charity_share?.toLocaleString() || '0',
    'نسبة البر': `${disclosure.charity_percentage}%`,
    'حصة ريع الوقف': disclosure.corpus_share?.toLocaleString() || '0',
    'نسبة ريع الوقف': `${disclosure.corpus_percentage}%`,
    'عدد المستفيدين': disclosure.total_beneficiaries || 0,
    'عدد الأبناء': disclosure.sons_count || 0,
    'عدد البنات': disclosure.daughters_count || 0,
    'عدد الزوجات': disclosure.wives_count || 0,
    'تاريخ الإفصاح': disclosure.disclosure_date,
    'الحالة': disclosure.status,
  };
}

// دالة مساعدة لتنسيق بيانات المستفيدين في الإفصاح
export function formatDisclosureBeneficiariesForExcel(beneficiaries: DisclosureBeneficiary[]) {
  return beneficiaries.map(b => ({
    'اسم المستفيد': b.beneficiary_name || '',
    'النوع': b.beneficiary_type || '',
    'المبلغ المخصص': b.allocated_amount?.toLocaleString() || '0',
    'عدد المدفوعات': b.payments_count || 0,
    'العلاقة': b.relationship || '',
  }));
}
