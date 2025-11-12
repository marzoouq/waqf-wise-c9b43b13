import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileCheck, Printer } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BeneficiaryCertificateProps {
  beneficiaryName: string;
  nationalId: string;
  category: string;
  registrationDate: string;
  status: string;
}

export function BeneficiaryCertificate({
  beneficiaryName,
  nationalId,
  category,
  registrationDate,
  status,
}: BeneficiaryCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation using jsPDF
    console.log("Generating certificate PDF");
  };

  return (
    <Card className="print:shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-500" />
            شهادة استحقاق
          </CardTitle>
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 ml-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
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
                <p className="font-semibold text-green-600">{status}</p>
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