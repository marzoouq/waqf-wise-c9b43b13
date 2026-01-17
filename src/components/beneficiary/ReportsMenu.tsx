import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileText,
  FileSpreadsheet,
  Building2,
  Receipt,
  ClipboardList,
  FileCheck,
  Download,
  User,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/ui/use-toast";
import { useBeneficiaryProfile } from "@/hooks/beneficiary";
import { useAuth } from "@/contexts/AuthContext";
import { Contract } from "@/hooks/property/useContracts";
import { useAnnualDisclosureExport } from "@/hooks/reports/useAnnualDisclosureExport";
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, getDefaultTableStyles, WAQF_COLORS } from "@/lib/pdf/arabic-pdf-utils";
import { matchesStatus } from "@/lib/constants";

interface ReportsMenuProps {
  type?: "beneficiary" | "waqf";
}

export function ReportsMenu({ type = "beneficiary" }: ReportsMenuProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { beneficiary, payments } = useBeneficiaryProfile(user?.id);
  const { fetchLatestDisclosure, fetchPropertiesWithContracts } = useAnnualDisclosureExport();

  const exportPaymentsPDF = async () => {
    try {
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      // تحميل الخط العربي
      const fontName = await loadArabicFontToPDF(doc);
      
      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, 'تقرير المدفوعات');
      
      const pageWidth = doc.internal.pageSize.width;
      
      // معلومات المستفيد
      doc.setFont(fontName, 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`الاسم: ${beneficiary?.full_name || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`رقم الهوية: ${beneficiary?.national_id || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الجوال: ${beneficiary?.phone || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الفئة: ${beneficiary?.category || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الحالة: ${beneficiary?.status || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 10;

      // الملخص المالي إذا وُجدت مدفوعات
      if (payments && payments.length > 0) {
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const avgAmount = totalAmount / payments.length;

        doc.setFont(fontName, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...WAQF_COLORS.primary);
        doc.text("الملخص المالي", pageWidth / 2, yPos, { align: "center" });
        yPos += 8;
        
        doc.setFont(fontName, 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`إجمالي المدفوعات: ${totalAmount.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`عدد الدفعات: ${payments.length}`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`متوسط الدفعة: ${avgAmount.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 10;

        // جدول المدفوعات
        const tableData = payments.map((payment) => [
          payment.payment_number || "-",
          new Date(payment.payment_date).toLocaleDateString("ar-SA"),
          payment.amount.toLocaleString("ar-SA") + " ر.س",
          payment.description || "-",
        ]);

        const tableStyles = getDefaultTableStyles(fontName);

        (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
          head: [["رقم الدفعة", "التاريخ", "المبلغ", "الوصف"]],
          body: tableData,
          startY: yPos,
          ...tableStyles,
          margin: { bottom: 30 },
          didDrawPage: () => {
            addWaqfFooter(doc, fontName);
          },
        });
      } else {
        // رسالة عدم وجود مدفوعات
        doc.setFontSize(12);
        doc.setTextColor(...WAQF_COLORS.muted);
        doc.text("لا توجد مدفوعات مسجلة حتى الآن", pageWidth / 2, yPos + 10, { align: "center" });
        doc.text("سيتم تحديث هذا التقرير عند إضافة مدفوعات جديدة", pageWidth / 2, yPos + 20, { align: "center" });
        addWaqfFooter(doc, fontName);
      }

      doc.save(`تقرير-المدفوعات-${Date.now()}.pdf`);

      toast({
        title: "تم التصدير",
        description: payments && payments.length > 0 
          ? "تم تصدير تقرير المدفوعات بنجاح"
          : "تم إنشاء التقرير - لا توجد مدفوعات حالياً",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  const exportAnnualDisclosure = async () => {
    try {
      // جلب آخر إفصاح سنوي
      const disclosure = await fetchLatestDisclosure();
      
      if (!disclosure) {
        toast({
          title: "لا توجد بيانات",
          description: "لم يتم العثور على إفصاحات سنوية",
          variant: "destructive",
        });
        return;
      }

      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      // تحميل الخط العربي
      const fontName = await loadArabicFontToPDF(doc);
      
      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, `الإفصاح السنوي ${disclosure.year}`);
      
      const pageWidth = doc.internal.pageSize.width;
      
      doc.setFont(fontName, 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`السنة: ${disclosure.year}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الوقف: ${disclosure.waqf_name}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 12;
      
      const financialData = [
        ["إيرادات السنة المالية", disclosure.total_revenues.toLocaleString("ar-SA") + " ر.س"],
        ["مصروفات السنة المالية", disclosure.total_expenses.toLocaleString("ar-SA") + " ر.س"],
        ["صافي الدخل", disclosure.net_income.toLocaleString("ar-SA") + " ر.س"],
        ["نصيب الناظر", disclosure.nazer_share.toLocaleString("ar-SA") + " ر.س"],
        ["نصيب الخيرية", disclosure.charity_share.toLocaleString("ar-SA") + " ر.س"],
        ["نصيب أصل الوقف", disclosure.corpus_share.toLocaleString("ar-SA") + " ر.س"],
      ];
      
      const tableStyles = getDefaultTableStyles(fontName);
      
      (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
        startY: yPos,
        head: [["البيان", "المبلغ"]],
        body: financialData,
        ...tableStyles,
        margin: { bottom: 30 },
        didDrawPage: () => {
          addWaqfFooter(doc, fontName);
        },
      });
      
      doc.save(`الإفصاح-السنوي-${disclosure.year}.pdf`);
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير الإفصاح السنوي بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير الإفصاح السنوي",
        variant: "destructive",
      });
    }
  };

  const exportPropertiesExcel = async () => {
    try {
      const properties = await fetchPropertiesWithContracts();

      if (!properties || properties.length === 0) {
        toast({
          title: "لا توجد بيانات",
          description: "لا توجد عقارات لتصديرها",
          variant: "destructive",
        });
        return;
      }

      const data = properties.map((prop) => {
        const contracts = prop.contracts as unknown as Contract[];
        const activeContracts = contracts?.filter((c) => matchesStatus(c.status, 'active')) || [];
        const monthlyRent = activeContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
        
        return {
          "اسم العقار": prop.name,
          "النوع": prop.type || "-",
          "الموقع": prop.location || "-",
          "إجمالي الوحدات": prop.units || 0,
          "الوحدات المؤجرة": prop.occupied || 0,
          "الوحدات الشاغرة": (prop.units || 0) - (prop.occupied || 0),
          "الإيجار الشهري": monthlyRent,
          "الإيجار السنوي": monthlyRent * 12,
          "الحالة": prop.status || "نشط",
        };
      });

      // Dynamic import for excel-helper
      const { exportToExcel } = await import("@/lib/excel-helper");
      
      await exportToExcel(data, `تقرير-العقارات-${Date.now()}`, "العقارات");

      toast({
        title: "تم التصدير",
        description: "تم تصدير تقرير العقارات إلى Excel بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  const exportAccountStatement = async () => {
    try {
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      // تحميل الخط العربي
      const fontName = await loadArabicFontToPDF(doc);
      
      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, 'كشف حساب المستفيد');
      
      const pageWidth = doc.internal.pageSize.width;

      // معلومات المستفيد الكاملة
      doc.setFont(fontName, 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`الاسم: ${beneficiary?.full_name || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`رقم الهوية: ${beneficiary?.national_id || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الجوال: ${beneficiary?.phone || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`البريد: ${beneficiary?.email || "لا يوجد"}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الفئة: ${beneficiary?.category || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الحالة: ${beneficiary?.status || ""}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`البنك: ${beneficiary?.bank_name || "لا يوجد"}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الآيبان: ${beneficiary?.iban || "لا يوجد"}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 10;

      // الملخص المالي
      if (payments && payments.length > 0) {
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const avgAmount = totalAmount / payments.length;

        doc.setFont(fontName, 'bold');
        doc.setFontSize(14);
        doc.setTextColor(...WAQF_COLORS.primary);
        doc.text("الملخص المالي", pageWidth / 2, yPos, { align: "center" });
        yPos += 8;
        
        doc.setFont(fontName, 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`إجمالي المدفوعات: ${totalAmount.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`عدد الدفعات: ${payments.length}`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 7;
        doc.text(`متوسط الدفعة: ${avgAmount.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, yPos, { align: 'right' });
        yPos += 10;

        // جدول المدفوعات
        const tableData = payments.map((payment) => [
          new Date(payment.payment_date).toLocaleDateString("ar-SA"),
          payment.description || "-",
          payment.amount.toLocaleString("ar-SA") + " ر.س",
        ]);

        const tableStyles = getDefaultTableStyles(fontName);

        (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
          head: [["التاريخ", "الوصف", "المبلغ"]],
          body: tableData,
          startY: yPos,
          ...tableStyles,
          margin: { bottom: 30 },
          didDrawPage: () => {
            addWaqfFooter(doc, fontName);
          },
        });

        // الإجمالي النهائي
        const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || yPos;
        doc.setFont(fontName, "bold");
        doc.setFontSize(12);
        doc.setTextColor(...WAQF_COLORS.primary);
        doc.text(`الإجمالي الكلي: ${totalAmount.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, finalY + 10, { align: 'right' });
      } else {
        // رسالة عدم وجود معاملات
        doc.setFontSize(12);
        doc.setTextColor(...WAQF_COLORS.muted);
        doc.text("لا توجد معاملات مالية مسجلة حتى الآن", pageWidth / 2, yPos + 10, { align: "center" });
        doc.text("سيتم تحديث الكشف عند إضافة معاملات جديدة", pageWidth / 2, yPos + 20, { align: "center" });
        addWaqfFooter(doc, fontName);
      }

      doc.save(`كشف-حساب-${Date.now()}.pdf`);

      toast({
        title: "تم التصدير",
        description: payments && payments.length > 0 
          ? "تم تصدير كشف الحساب بنجاح"
          : "تم إنشاء الكشف - لا توجد معاملات حالياً",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  const exportPersonalDataPDF = async () => {
    try {
      if (!beneficiary) {
        toast({
          title: "خطأ",
          description: "لم يتم العثور على بيانات المستفيد",
          variant: "destructive",
        });
        return;
      }

      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // تحميل الخط العربي
      const fontName = await loadArabicFontToPDF(doc);
      
      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, 'تقرير البيانات الشخصية');
      
      const pageWidth = doc.internal.pageSize.width;

      // المعلومات الشخصية
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text("المعلومات الشخصية", pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`الاسم الكامل: ${beneficiary.full_name}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`رقم الهوية الوطنية: ${beneficiary.national_id}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الجنس: ${beneficiary.gender || "غير محدد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`تاريخ الميلاد: ${beneficiary.date_of_birth ? new Date(beneficiary.date_of_birth).toLocaleDateString("ar-SA") : "غير محدد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الجنسية: ${beneficiary.nationality || "غير محددة"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 10;

      // معلومات الاتصال
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text("معلومات الاتصال", pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`رقم الجوال: ${beneficiary.phone}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`البريد الإلكتروني: ${beneficiary.email || "لا يوجد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`المدينة: ${beneficiary.city || "غير محددة"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`العنوان: ${beneficiary.address || "غير محدد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 10;

      // المعلومات العائلية
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text("المعلومات العائلية", pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`الحالة الاجتماعية: ${beneficiary.marital_status || "غير محددة"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`عدد الأبناء: ${beneficiary.number_of_sons || 0}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`عدد البنات: ${beneficiary.number_of_daughters || 0}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`عدد الزوجات: ${beneficiary.number_of_wives || 0}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`حجم الأسرة: ${beneficiary.family_size || 0}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 10;

      // معلومات العمل والسكن
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text("معلومات العمل والسكن", pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`الحالة الوظيفية: ${beneficiary.employment_status || "غير محددة"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الدخل الشهري: ${beneficiary.monthly_income ? beneficiary.monthly_income.toLocaleString("ar-SA") + " ر.س" : "غير محدد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`نوع السكن: ${beneficiary.housing_type || "غير محدد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 10;

      // معلومات الوقف
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text("معلومات الوقف", pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`الفئة: ${beneficiary.category}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`القبيلة: ${beneficiary.tribe || "غير محددة"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الحالة: ${beneficiary.status}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`مستوى الأولوية: ${beneficiary.priority_level || "غير محدد"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`تاريخ القيد: ${new Date(beneficiary.created_at).toLocaleDateString("ar-SA")}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 10;

      // المعلومات البنكية
      doc.setFont(fontName, "bold");
      doc.setFontSize(14);
      doc.setTextColor(...WAQF_COLORS.primary);
      doc.text("المعلومات البنكية", pageWidth - 20, yPos, { align: 'right' });
      yPos += 8;

      doc.setFont(fontName, "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`البنك: ${beneficiary.bank_name || "لم يتم التحديث"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`رقم الحساب: ${beneficiary.bank_account_number || "لم يتم التحديث"}`, pageWidth - 25, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الآيبان: ${beneficiary.iban || "لم يتم التحديث"}`, pageWidth - 25, yPos, { align: 'right' });

      // الملاحظات
      if (beneficiary.notes) {
        yPos += 10;
        doc.setFont(fontName, "bold");
        doc.setFontSize(14);
        doc.setTextColor(...WAQF_COLORS.primary);
        doc.text("ملاحظات إدارية", pageWidth - 20, yPos, { align: 'right' });
        yPos += 8;
        doc.setFont(fontName, "normal");
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        const splitNotes = doc.splitTextToSize(beneficiary.notes, 170);
        doc.text(splitNotes, pageWidth - 25, yPos, { align: 'right' });
      }

      // إضافة التذييل
      addWaqfFooter(doc, fontName);

      doc.save(`البيانات-الشخصية-${beneficiary.full_name}-${Date.now()}.pdf`);

      toast({
        title: "تم التصدير",
        description: "تم تصدير تقرير البيانات الشخصية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  const exportPropertiesReportPDF = async () => {
    try {
      const properties = await fetchPropertiesWithContracts();

      if (!properties || properties.length === 0) {
        toast({
          title: "لا توجد بيانات",
          description: "لا توجد عقارات لتصديرها",
          variant: "destructive",
        });
        return;
      }

      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();

      // تحميل الخط العربي
      const fontName = await loadArabicFontToPDF(doc);
      
      // إضافة ترويسة الوقف
      let yPos = addWaqfHeader(doc, fontName, 'تقرير العقارات والإيجارات');
      
      const pageWidth = doc.internal.pageSize.width;

      // حساب الإجماليات
      const totalMonthlyRent = properties.reduce((sum, prop) => {
        const contracts = prop.contracts as unknown as Contract[];
        const activeContracts = contracts?.filter((c) => matchesStatus(c.status, 'active')) || [];
        return sum + activeContracts.reduce((cSum, c) => cSum + (c.monthly_rent || 0), 0);
      }, 0);
      const totalAnnualRent = totalMonthlyRent * 12;

      // الملخص
      doc.setFont(fontName, 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`عدد العقارات: ${properties.length}`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الإيجار الشهري: ${totalMonthlyRent.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 7;
      doc.text(`الإيجار السنوي: ${totalAnnualRent.toLocaleString("ar-SA")} ر.س`, pageWidth - 20, yPos, { align: 'right' });
      yPos += 10;

      // جدول العقارات
      const tableData = properties.map((prop) => {
        const contracts = prop.contracts as unknown as Contract[];
        const activeContracts = contracts?.filter((c) => matchesStatus(c.status, 'active')) || [];
        const monthlyRent = activeContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
        
        return [
          prop.name,
          prop.type || "-",
          `${prop.units || 0}`,
          `${prop.occupied || 0}`,
          `${monthlyRent.toLocaleString("ar-SA")} ر.س`,
        ];
      });

      const tableStyles = getDefaultTableStyles(fontName);

      (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
        head: [["اسم العقار", "النوع", "الوحدات", "المؤجرة", "الإيجار الشهري"]],
        body: tableData,
        startY: yPos,
        ...tableStyles,
        margin: { bottom: 30 },
        didDrawPage: () => {
          addWaqfFooter(doc, fontName);
        },
      });

      doc.save(`تقرير-العقارات-${Date.now()}.pdf`);

      toast({
        title: "تم التصدير",
        description: "تم تصدير تقرير العقارات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  // تقارير المستفيد
  const beneficiaryReports = (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>حالة البيانات</AlertTitle>
        <AlertDescription>
          التقارير الشخصية تعمل على البيانات الموجودة فعلياً. بعض التقارير قد تكون فارغة إذا لم يتم تسجيل مدفوعات بعد.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">التقارير الشخصية</p>
        <Button
          onClick={exportPersonalDataPDF}
          className="w-full justify-start"
          variant="outline"
        >
          <User className="ms-2 h-4 w-4" />
          تقرير البيانات الشخصية (PDF)
        </Button>
        <Button
          onClick={exportPaymentsPDF}
          className="w-full justify-start"
          variant="outline"
        >
          <FileText className="ms-2 h-4 w-4" />
          تقرير المدفوعات (PDF)
        </Button>
        <Button
          onClick={exportAccountStatement}
          className="w-full justify-start"
          variant="outline"
        >
          <Receipt className="ms-2 h-4 w-4" />
          كشف الحساب (PDF)
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-2">تقارير العقارات</p>
        <Button
          onClick={exportPropertiesReportPDF}
          className="w-full justify-start"
          variant="outline"
        >
          <Building2 className="ms-2 h-4 w-4" />
          تقرير العقارات (PDF)
        </Button>
        <Button
          onClick={exportPropertiesExcel}
          className="w-full justify-start"
          variant="outline"
        >
          <FileSpreadsheet className="ms-2 h-4 w-4" />
          تقرير العقارات (Excel)
        </Button>
      </div>
    </div>
  );

  // تقارير الوقف
  const waqfReports = (
    <>
      <Button variant="outline" onClick={exportAnnualDisclosure} className="justify-start">
        <FileSpreadsheet className="ms-2 h-4 w-4" />
        الإفصاح السنوي (PDF)
      </Button>
      <Button variant="outline" onClick={exportPropertiesExcel} className="justify-start">
        <Building2 className="ms-2 h-4 w-4" />
        تقرير العقارات (Excel)
      </Button>
    </>
  );

  // عرض التقارير حسب النوع
  if (type === "waqf") {
    return (
      <Card>
        <CardHeader className="bg-gradient-to-br from-success/5 to-background">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-success" />
            تقارير الوقف
          </CardTitle>
          <CardDescription>الإفصاحات المالية وتقارير العقارات</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{waqfReports}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-br from-primary/5 to-background">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Download className="h-5 w-5 text-primary" />
          تقاريري الشخصية
        </CardTitle>
        <CardDescription>التقارير الخاصة بحسابك ومدفوعاتك</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{beneficiaryReports}</div>
      </CardContent>
    </Card>
  );
}
