import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  FileSpreadsheet,
  Building2,
  Receipt,
  ClipboardList,
  FileCheck,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useBeneficiaryProfile } from "@/hooks/useBeneficiaryProfile";
import { useAuth } from "@/hooks/useAuth";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

interface ReportsMenuProps {
  type?: "beneficiary" | "waqf";
}

export function ReportsMenu({ type = "beneficiary" }: ReportsMenuProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { beneficiary, payments } = useBeneficiaryProfile(user?.id);

  const exportPaymentsPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // العنوان
      doc.setFontSize(16);
      doc.text("Payment Report / تقرير المدفوعات", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Beneficiary / المستفيد: ${beneficiary?.full_name || ""}`, 20, 35);
      doc.text(`Date / التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, 20, 45);
      
      // الجدول
      const tableData = payments.map((payment) => [
        payment.payment_number || "-",
        new Date(payment.payment_date).toLocaleDateString("ar-SA"),
        payment.amount.toLocaleString("ar-SA"),
        payment.description || "-",
      ]);
      
      (doc as any).autoTable({
        startY: 55,
        head: [["#", "Date / التاريخ", "Amount / المبلغ", "Description / الوصف"]],
        body: tableData,
        styles: { font: "helvetica" },
      });
      
      doc.save(`payments-report-${Date.now()}.pdf`);
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير تقرير المدفوعات بنجاح",
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
        .single();

      if (error) throw error;

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
      
      (doc as any).autoTable({
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
      const { data: properties, error } = await supabase
        .from("properties")
        .select("name, location, total_units, occupied_units")
        .eq("status", "نشط");

      if (error) throw error;

      const worksheet = XLSX.utils.json_to_sheet(
        properties?.map((p) => ({
          "اسم العقار": p.name,
          "الموقع": p.location,
          "إجمالي الوحدات": p.total_units,
          "الوحدات المشغولة": p.occupied_units,
          "الوحدات الشاغرة": (p.total_units || 0) - (p.occupied_units || 0),
        })) || []
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "العقارات");
      XLSX.writeFile(workbook, `properties-report-${Date.now()}.xlsx`);

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

  const exportAccountStatement = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("Account Statement / كشف الحساب", 105, 20, { align: "center" });
      
      doc.setFontSize(12);
      doc.text(`Name / الاسم: ${beneficiary?.full_name || ""}`, 20, 35);
      doc.text(`ID / الرقم الوطني: ${beneficiary?.national_id || ""}`, 20, 45);
      doc.text(`Date / التاريخ: ${new Date().toLocaleDateString("ar-SA")}`, 20, 55);
      
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      
      doc.setFontSize(14);
      doc.text(`Total / الإجمالي: ${totalPayments.toLocaleString("ar-SA")} ر.س`, 20, 70);
      
      const tableData = payments.map((payment) => [
        new Date(payment.payment_date).toLocaleDateString("ar-SA"),
        payment.description || "-",
        payment.amount.toLocaleString("ar-SA"),
      ]);
      
      (doc as any).autoTable({
        startY: 80,
        head: [["Date / التاريخ", "Description / البيان", "Amount / المبلغ"]],
        body: tableData,
      });
      
      doc.save(`account-statement-${Date.now()}.pdf`);
      
      toast({
        title: "تم التصدير",
        description: "تم تصدير كشف الحساب بنجاح",
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
    <>
      <Button variant="outline" onClick={exportPaymentsPDF} className="justify-start">
        <FileText className="ml-2 h-4 w-4" />
        تقرير المدفوعات (PDF)
      </Button>
      <Button variant="outline" onClick={exportAccountStatement} className="justify-start">
        <Receipt className="ml-2 h-4 w-4" />
        كشف الحساب (PDF)
      </Button>
    </>
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
        <CardHeader className="bg-gradient-to-br from-green-500/5 to-background">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
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
