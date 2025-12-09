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
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBeneficiaryProfile } from "@/hooks/beneficiary";
import { useAuth } from "@/hooks/useAuth";
import { Contract } from "@/hooks/useContracts";

interface ReportsMenuProps {
  type?: "beneficiary" | "waqf";
}

export function ReportsMenu({ type = "beneficiary" }: ReportsMenuProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { beneficiary, payments } = useBeneficiaryProfile(user?.id);

  const exportPaymentsPDF = async () => {
    try {
      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      // العنوان
      doc.setFontSize(18);
      doc.text("تقرير المدفوعات", 105, 20, { align: "center" });
      
      // معلومات المستفيد
      doc.setFontSize(11);
      doc.text(`الاسم: ${beneficiary?.full_name || ""}`, 20, 35);
      doc.text(`رقم الهوية: ${beneficiary?.national_id || ""}`, 20, 42);
      doc.text(`الجوال: ${beneficiary?.phone || ""}`, 20, 49);
      doc.text(`الفئة: ${beneficiary?.category || ""}`, 120, 35);
      doc.text(`الحالة: ${beneficiary?.status || ""}`, 120, 42);
      doc.text(`التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, 120, 49);

      // الملخص المالي إذا وُجدت مدفوعات
      if (payments && payments.length > 0) {
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const avgAmount = totalAmount / payments.length;

        doc.setFontSize(14);
        doc.text("الملخص المالي", 105, 60, { align: "center" });
        doc.setFontSize(11);
        doc.text(`إجمالي المدفوعات: ${totalAmount.toLocaleString("ar-SA")} ر.س`, 20, 68);
        doc.text(`عدد الدفعات: ${payments.length}`, 20, 75);
        doc.text(`متوسط الدفعة: ${avgAmount.toLocaleString("ar-SA")} ر.س`, 20, 82);

        // جدول المدفوعات
        const tableData = payments.map((payment) => [
          payment.payment_number || "-",
          new Date(payment.payment_date).toLocaleDateString("ar-SA"),
          payment.amount.toLocaleString("ar-SA") + " ر.س",
          payment.description || "-",
        ]);

        doc.autoTable({
          head: [["رقم الدفعة", "التاريخ", "المبلغ", "الوصف"]],
          body: tableData,
          startY: 90,
          styles: {
            font: "helvetica",
            fontSize: 9,
            halign: "right",
          },
          headStyles: {
            fillColor: [34, 139, 34],
            textColor: [255, 255, 255],
          },
        });
      } else {
        // رسالة عدم وجود مدفوعات
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text("لا توجد مدفوعات مسجلة حتى الآن", 105, 70, { align: "center" });
        doc.text("سيتم تحديث هذا التقرير عند إضافة مدفوعات جديدة", 105, 80, { align: "center" });
      }

      doc.save(`payments-report-${Date.now()}.pdf`);

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
      const { data: disclosure, error } = await supabase
        .from("annual_disclosures")
        .select("*")
        .order("year", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (!disclosure) {
        toast({
          title: "لا توجد بيانات",
          description: "لم يتم العثور على إفصاحات سنوية",
          variant: "destructive",
        });
        return;
      }

      if (error) throw error;

      const [jsPDFModule, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Annual Disclosure / الإفصاح السنوي", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Year / السنة: ${disclosure.year}`, 20, 40);
      doc.text(`Waqf / الوقف: ${disclosure.waqf_name}`, 20, 50);
      
      const financialData = [
        ["Total Revenue / إجمالي الإيرادات", disclosure.total_revenues.toLocaleString("ar-SA")],
        ["Total Expenses / إجمالي المصروفات", disclosure.total_expenses.toLocaleString("ar-SA")],
        ["Net Income / صافي الدخل", disclosure.net_income.toLocaleString("ar-SA")],
        ["Nazer Share / نصيب الناظر", disclosure.nazer_share.toLocaleString("ar-SA")],
        ["Charity Share / نصيب الخيرية", disclosure.charity_share.toLocaleString("ar-SA")],
        ["Corpus Share / نصيب أصل الوقف", disclosure.corpus_share.toLocaleString("ar-SA")],
      ];
      
      doc.autoTable({
        startY: 60,
        head: [["Item / البيان", "Amount / المبلغ (ر.س)"]],
        body: financialData,
      });
      
      doc.save(`annual-disclosure-${disclosure.year}.pdf`);
      
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
      const { data: properties } = await supabase
        .from("properties")
        .select(`
          *,
          contracts:contracts(*)
        `)
        .order("name");

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
        const activeContracts = contracts?.filter((c) => c.status === "نشط") || [];
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
      
      await exportToExcel(data, `properties-report-${Date.now()}`, "العقارات");

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
      
      // العنوان
      doc.setFontSize(18);
      doc.text("كشف حساب المستفيد", 105, 20, { align: "center" });

      // معلومات المستفيد الكاملة
      doc.setFontSize(11);
      doc.text(`الاسم: ${beneficiary?.full_name || ""}`, 20, 35);
      doc.text(`رقم الهوية: ${beneficiary?.national_id || ""}`, 20, 42);
      doc.text(`الجوال: ${beneficiary?.phone || ""}`, 20, 49);
      doc.text(`البريد: ${beneficiary?.email || "لا يوجد"}`, 20, 56);
      
      doc.text(`الفئة: ${beneficiary?.category || ""}`, 120, 35);
      doc.text(`الحالة: ${beneficiary?.status || ""}`, 120, 42);
      doc.text(`البنك: ${beneficiary?.bank_name || "لا يوجد"}`, 120, 49);
      doc.text(`الآيبان: ${beneficiary?.iban || "لا يوجد"}`, 120, 56);

      // الملخص المالي
      if (payments && payments.length > 0) {
        const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const avgAmount = totalAmount / payments.length;

        doc.setFontSize(14);
        doc.text("الملخص المالي", 105, 68, { align: "center" });
        doc.setFontSize(11);
        doc.text(`إجمالي المدفوعات: ${totalAmount.toLocaleString("ar-SA")} ر.س`, 20, 76);
        doc.text(`عدد الدفعات: ${payments.length}`, 20, 83);
        doc.text(`متوسط الدفعة: ${avgAmount.toLocaleString("ar-SA")} ر.س`, 20, 90);

        // جدول المدفوعات
        const tableData = payments.map((payment) => [
          new Date(payment.payment_date).toLocaleDateString("ar-SA"),
          payment.description || "-",
          payment.amount.toLocaleString("ar-SA") + " ر.س",
        ]);

        doc.autoTable({
          head: [["التاريخ", "الوصف", "المبلغ"]],
          body: tableData,
          startY: 98,
          styles: {
            font: "helvetica",
            fontSize: 9,
            halign: "right",
          },
          headStyles: {
            fillColor: [34, 139, 34],
            textColor: [255, 255, 255],
          },
        });

        // الإجمالي النهائي
        const finalY = doc.lastAutoTable?.finalY || 98;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`الإجمالي الكلي: ${totalAmount.toLocaleString("ar-SA")} ر.س`, 20, finalY + 10);
      } else {
        // رسالة عدم وجود معاملات
        doc.setFontSize(12);
        doc.setTextColor(150, 150, 150);
        doc.text("لا توجد معاملات مالية مسجلة حتى الآن", 105, 75, { align: "center" });
        doc.text("سيتم تحديث الكشف عند إضافة معاملات جديدة", 105, 85, { align: "center" });
      }

      doc.save(`account-statement-${Date.now()}.pdf`);

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

      // العنوان
      doc.setFontSize(18);
      doc.text("تقرير البيانات الشخصية", 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}`, 105, 28, { align: "center" });

      let yPos = 40;

      // المعلومات الشخصية
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("المعلومات الشخصية", 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`الاسم الكامل: ${beneficiary.full_name}`, 25, yPos);
      yPos += 7;
      doc.text(`رقم الهوية الوطنية: ${beneficiary.national_id}`, 25, yPos);
      yPos += 7;
      doc.text(`الجنس: ${beneficiary.gender || "غير محدد"}`, 25, yPos);
      yPos += 7;
      doc.text(`تاريخ الميلاد: ${beneficiary.date_of_birth ? new Date(beneficiary.date_of_birth).toLocaleDateString("ar-SA") : "غير محدد"}`, 25, yPos);
      yPos += 7;
      doc.text(`الجنسية: ${beneficiary.nationality || "غير محددة"}`, 25, yPos);
      yPos += 10;

      // معلومات الاتصال
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("معلومات الاتصال", 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`رقم الجوال: ${beneficiary.phone}`, 25, yPos);
      yPos += 7;
      doc.text(`البريد الإلكتروني: ${beneficiary.email || "لا يوجد"}`, 25, yPos);
      yPos += 7;
      doc.text(`المدينة: ${beneficiary.city || "غير محددة"}`, 25, yPos);
      yPos += 7;
      doc.text(`العنوان: ${beneficiary.address || "غير محدد"}`, 25, yPos);
      yPos += 10;

      // المعلومات العائلية
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("المعلومات العائلية", 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`الحالة الاجتماعية: ${beneficiary.marital_status || "غير محددة"}`, 25, yPos);
      yPos += 7;
      doc.text(`عدد الأبناء: ${beneficiary.number_of_sons || 0}`, 25, yPos);
      yPos += 7;
      doc.text(`عدد البنات: ${beneficiary.number_of_daughters || 0}`, 25, yPos);
      yPos += 7;
      doc.text(`عدد الزوجات: ${beneficiary.number_of_wives || 0}`, 25, yPos);
      yPos += 7;
      doc.text(`حجم الأسرة: ${beneficiary.family_size || 0}`, 25, yPos);
      yPos += 10;

      // معلومات العمل والسكن
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("معلومات العمل والسكن", 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`الحالة الوظيفية: ${beneficiary.employment_status || "غير محددة"}`, 25, yPos);
      yPos += 7;
      doc.text(`الدخل الشهري: ${beneficiary.monthly_income ? beneficiary.monthly_income.toLocaleString("ar-SA") + " ر.س" : "غير محدد"}`, 25, yPos);
      yPos += 7;
      doc.text(`نوع السكن: ${beneficiary.housing_type || "غير محدد"}`, 25, yPos);
      yPos += 10;

      // معلومات الوقف
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("معلومات الوقف", 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`الفئة: ${beneficiary.category}`, 25, yPos);
      yPos += 7;
      doc.text(`القبيلة: ${beneficiary.tribe || "غير محددة"}`, 25, yPos);
      yPos += 7;
      doc.text(`الحالة: ${beneficiary.status}`, 25, yPos);
      yPos += 7;
      doc.text(`مستوى الأولوية: ${beneficiary.priority_level || "غير محدد"}`, 25, yPos);
      yPos += 7;
      doc.text(`تاريخ القيد: ${new Date(beneficiary.created_at).toLocaleDateString("ar-SA")}`, 25, yPos);
      yPos += 10;

      // المعلومات البنكية
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("المعلومات البنكية", 20, yPos);
      yPos += 8;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`البنك: ${beneficiary.bank_name || "لم يتم التحديث"}`, 25, yPos);
      yPos += 7;
      doc.text(`رقم الحساب: ${beneficiary.bank_account_number || "لم يتم التحديث"}`, 25, yPos);
      yPos += 7;
      doc.text(`الآيبان: ${beneficiary.iban || "لم يتم التحديث"}`, 25, yPos);

      // الملاحظات
      if (beneficiary.notes) {
        yPos += 10;
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("ملاحظات إدارية", 20, yPos);
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const splitNotes = doc.splitTextToSize(beneficiary.notes, 170);
        doc.text(splitNotes, 25, yPos);
      }

      doc.save(`personal-data-${beneficiary.full_name}-${Date.now()}.pdf`);

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
      const { data: properties } = await supabase
        .from("properties")
        .select(`
          *,
          contracts:contracts(*)
        `)
        .order("name");

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

      // العنوان
      doc.setFontSize(18);
      doc.text("تقرير العقارات والإيجارات", 105, 20, { align: "center" });
      doc.setFontSize(10);
      doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}`, 105, 28, { align: "center" });

      // حساب الإجماليات
      const totalMonthlyRent = properties.reduce((sum, prop) => {
        const contracts = prop.contracts as unknown as Contract[];
        const activeContracts = contracts?.filter((c) => c.status === "نشط") || [];
        return sum + activeContracts.reduce((cSum, c) => cSum + (c.monthly_rent || 0), 0);
      }, 0);
      const totalAnnualRent = totalMonthlyRent * 12;

      // الملخص
      doc.setFontSize(12);
      doc.text(`عدد العقارات: ${properties.length}`, 20, 40);
      doc.text(`الإيجار الشهري: ${totalMonthlyRent.toLocaleString("ar-SA")} ر.س`, 20, 47);
      doc.text(`الإيجار السنوي: ${totalAnnualRent.toLocaleString("ar-SA")} ر.س`, 20, 54);

      // جدول العقارات
      const tableData = properties.map((prop) => {
        const contracts = prop.contracts as unknown as Contract[];
        const activeContracts = contracts?.filter((c) => c.status === "نشط") || [];
        const monthlyRent = activeContracts.reduce((sum, c) => sum + (c.monthly_rent || 0), 0);
        
        return [
          prop.name,
          prop.type || "-",
          `${prop.units || 0}`,
          `${prop.occupied || 0}`,
          `${monthlyRent.toLocaleString("ar-SA")} ر.س`,
        ];
      });

      doc.autoTable({
        head: [["اسم العقار", "النوع", "الوحدات", "المؤجرة", "الإيجار الشهري"]],
        body: tableData,
        startY: 65,
        styles: {
          font: "helvetica",
          fontSize: 9,
          halign: "right",
        },
        headStyles: {
          fillColor: [34, 139, 34],
          textColor: [255, 255, 255],
        },
      });

      doc.save(`properties-report-${Date.now()}.pdf`);

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
          <User className="ml-2 h-4 w-4" />
          تقرير البيانات الشخصية (PDF)
        </Button>
        <Button
          onClick={exportPaymentsPDF}
          className="w-full justify-start"
          variant="outline"
        >
          <FileText className="ml-2 h-4 w-4" />
          تقرير المدفوعات (PDF)
        </Button>
        <Button
          onClick={exportAccountStatement}
          className="w-full justify-start"
          variant="outline"
        >
          <Receipt className="ml-2 h-4 w-4" />
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
          <Building2 className="ml-2 h-4 w-4" />
          تقرير العقارات (PDF)
        </Button>
        <Button
          onClick={exportPropertiesExcel}
          className="w-full justify-start"
          variant="outline"
        >
          <FileSpreadsheet className="ml-2 h-4 w-4" />
          تقرير العقارات (Excel)
        </Button>
      </div>
    </div>
  );

  // تقارير الوقف
  const waqfReports = (
    <>
      <Button variant="outline" onClick={exportAnnualDisclosure} className="justify-start">
        <FileSpreadsheet className="ml-2 h-4 w-4" />
        الإفصاح السنوي (PDF)
      </Button>
      <Button variant="outline" onClick={exportPropertiesExcel} className="justify-start">
        <Building2 className="ml-2 h-4 w-4" />
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
