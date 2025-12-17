import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCheck, Printer } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { loadArabicFontToPDF, addWaqfFooter, WAQF_COLORS } from "@/lib/pdf/arabic-pdf-utils";
import { WAQF_IDENTITY } from "@/lib/waqf-identity";

interface BeneficiaryCertificateProps {
  beneficiaryName: string;
  beneficiaryId: string;
  nationalId: string;
  category: string;
  registrationDate: string;
  status: string;
}

export function BeneficiaryCertificate({
  beneficiaryName,
  beneficiaryId,
  nationalId,
  category,
  registrationDate,
  status,
}: BeneficiaryCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePDF = async () => {
    const [jsPDFModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // تحميل الخط العربي من الملف المحلي
    const fontName = await loadArabicFontToPDF(doc);

    const pageWidth = doc.internal.pageSize.width;

    // إطار الشهادة
    doc.setLineWidth(1);
    doc.setDrawColor(...WAQF_COLORS.primary);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 180, 267);

    // شعار واسم الوقف
    doc.setFont(fontName, "bold");
    doc.setFontSize(18);
    doc.setTextColor(...WAQF_COLORS.primary);
    doc.text(`${WAQF_IDENTITY.logo} ${WAQF_IDENTITY.name}`, pageWidth / 2, 35, { align: "center" });

    // العنوان الرئيسي
    doc.setFontSize(24);
    doc.text("شهادة استحقاق", pageWidth / 2, 55, { align: "center" });

    // العنوان الفرعي
    doc.setFont(fontName, "normal");
    doc.setFontSize(14);
    doc.setTextColor(...WAQF_COLORS.muted);
    doc.text("من منصة إدارة الوقف الإلكترونية", pageWidth / 2, 68, { align: "center" });

    // المحتوى الرئيسي
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    const startY = 90;
    
    doc.text("تشهد منصة إدارة الوقف أن:", pageWidth / 2, startY, { align: "center" });
    
    // اسم المستفيد
    doc.setFont(fontName, "bold");
    doc.setFontSize(20);
    doc.setTextColor(...WAQF_COLORS.primary);
    doc.text(beneficiaryName, pageWidth / 2, startY + 20, { align: "center" });
    
    // رقم الهوية
    doc.setFont(fontName, "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`رقم الهوية: ${nationalId}`, pageWidth / 2, startY + 35, { align: "center" });
    
    // النص
    doc.text(
      "هو من المستفيدين المسجلين لدى الوقف",
      pageWidth / 2,
      startY + 55,
      { align: "center" }
    );
    
    doc.text(
      "وله الحق في الانتفاع من غلة الوقف حسب الشروط",
      pageWidth / 2,
      startY + 70,
      { align: "center" }
    );

    // الفئة والحالة
    doc.setFont(fontName, "bold");
    doc.setTextColor(...WAQF_COLORS.secondary);
    doc.text(`الفئة: ${category}`, pageWidth / 2, startY + 95, { align: "center" });
    doc.text(`الحالة: ${status}`, pageWidth / 2, startY + 110, { align: "center" });

    // تاريخ الإصدار
    doc.setFont(fontName, "normal");
    doc.setFontSize(12);
    doc.setTextColor(...WAQF_COLORS.muted);
    doc.text(
      `تاريخ الإصدار: ${format(new Date(), "dd MMMM yyyy", { locale: ar })}`,
      pageWidth / 2,
      startY + 135,
      { align: "center" }
    );

    // منطقة التوقيع
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("الناظر", 50, 240);
    doc.line(30, 245, 80, 245);
    
    doc.text("الختم الرسمي", 150, 240);
    doc.setDrawColor(...WAQF_COLORS.primary);
    doc.circle(150, 255, 15);

    // التذييل
    addWaqfFooter(doc, fontName);

    doc.save(`شهادة-استحقاق-${beneficiaryName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <Card className="print:shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-success" />
            شهادة استحقاق
          </CardTitle>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 ms-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 ms-2" />
              تحميل PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-primary rounded-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2 border-b pb-4">
            <h2 className="text-2xl font-bold text-primary">شهادة استحقاق</h2>
            <p className="text-muted-foreground">منصة إدارة الوقف الإلكترونية</p>
          </div>

          {/* Content */}
          <div className="space-y-4 text-center">
            <p className="text-lg">تشهد منصة إدارة الوقف الإلكترونية بأن:</p>
            
            <div className="py-4">
              <p className="text-2xl font-bold text-primary mb-2">{beneficiaryName}</p>
              <p className="text-muted-foreground">رقم الهوية: {nationalId}</p>
            </div>

            <p className="text-lg">
              مسجل كمستفيد في فئة <span className="font-bold text-primary">{category}</span>
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg text-right max-w-md mx-auto">
              <div>
                <p className="text-sm text-muted-foreground">تاريخ التسجيل</p>
                <p className="font-semibold">
                  {format(new Date(registrationDate), "dd MMMM yyyy", { locale: ar })}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p className="font-semibold text-success">{status}</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              ويحق له الحصول على المستحقات والخدمات المقررة له حسب لوائح الوقف
            </p>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              صدرت هذه الشهادة بتاريخ:{" "}
              {format(new Date(), "dd MMMM yyyy", { locale: ar })}
            </p>
            <div className="flex justify-between items-center pt-4">
              <div className="text-center">
                <div className="border-t border-muted-foreground pt-2 min-w-[150px]">
                  <p className="text-sm">توقيع المسؤول</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-muted-foreground pt-2 min-w-[150px]">
                  <p className="text-sm">ختم الوقف</p>
                </div>
              </div>
            </div>
          </div>

          {/* Watermark */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              رقم مرجعي: WF-{nationalId}-{format(new Date(), "yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
