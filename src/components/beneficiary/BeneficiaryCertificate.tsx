import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCheck, Printer } from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";

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

    // Set Arabic font
    doc.addFont("https://cdn.jsdelivr.net/npm/amiri-font@1.0.0/Amiri-Regular.ttf", "Amiri", "normal");
    doc.setFont("Amiri");
    doc.setR2L(true);

    // Border
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);
    doc.setLineWidth(0.5);
    doc.rect(15, 15, 180, 267);

    // Title with decorative elements
    doc.setFontSize(24);
    doc.text("شهادة استحقاق", 105, 40, { align: "center" });

    // Subtitle
    doc.setFontSize(16);
    doc.text("من منصة إدارة الوقف الإلكترونية", 105, 55, { align: "center" });

    // Main content
    doc.setFontSize(14);
    const startY = 80;
    
    doc.text(`تشهد منصة إدارة الوقف أن:`, 105, startY, { align: "center" });
    
    doc.setFontSize(18);
    doc.text(beneficiaryName, 105, startY + 20, { align: "center" });
    
    doc.setFontSize(14);
    doc.text(`رقم الهوية: ${nationalId}`, 105, startY + 35, { align: "center" });
    
    doc.text(
      `هو من المستفيدين المسجلين لدى الوقف`,
      105,
      startY + 55,
      { align: "center" }
    );
    
    doc.text(
      `وله الحق في الانتفاع من غلة الوقف حسب الشروط`,
      105,
      startY + 70,
      { align: "center" }
    );

    // Category and Status
    doc.text(`الفئة: ${category}`, 105, startY + 90, { align: "center" });
    doc.text(`الحالة: ${status}`, 105, startY + 105, { align: "center" });

    // Issue date
    doc.setFontSize(12);
    doc.text(
      `تاريخ الإصدار: ${format(new Date(), "dd MMMM yyyy", { locale: ar })}`,
      105,
      startY + 130,
      { align: "center" }
    );

    // Signature area
    doc.setFontSize(14);
    doc.text("الناظر", 50, 240);
    doc.line(30, 245, 80, 245);
    
    doc.text("الختم الرسمي", 150, 240);
    doc.circle(150, 255, 15);

    // Footer
    doc.setFontSize(10);
    doc.text(
      "هذه الشهادة صادرة إلكترونياً ولا تحتاج لتوقيع",
      105,
      270,
      { align: "center" }
    );

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
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={handleGeneratePDF}>
              <Download className="h-4 w-4 ml-2" />
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