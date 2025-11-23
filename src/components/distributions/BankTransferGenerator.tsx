import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BankTransferGeneratorProps {
  distributionId: string;
  onSuccess?: () => void;
}

export function BankTransferGenerator({ distributionId, onSuccess }: BankTransferGeneratorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState<"ISO20022" | "SWIFT_MT940" | "CSV" | "EXCEL">("CSV");
  const [generatedFile, setGeneratedFile] = useState<{
    fileNumber: string;
    totalAmount: number;
    totalTransactions: number;
    fileContent: string;
  } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // جلب تفاصيل التوزيع
      const { data: details, error: detailsError } = await supabase
        .from('distribution_details')
        .select(`
          *,
          beneficiaries (
            full_name,
            iban,
            bank_name
          )
        `)
        .eq('distribution_id', distributionId)
        .eq('payment_status', 'approved');

      if (detailsError) throw detailsError;

      if (!details || details.length === 0) {
        toast({
          title: "تنبيه",
          description: "لا توجد دفعات معتمدة للتصدير",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // توليد رقم الملف
      const { data: fileNumber, error: fileNumberError } = await supabase
        .rpc('generate_transfer_file_number');

      if (fileNumberError) throw fileNumberError;

      // حساب الإجماليات
      const totalAmount = details.reduce((sum, detail) => sum + detail.allocated_amount, 0);
      const totalTransactions = details.length;

      // توليد محتوى الملف حسب الصيغة
      let fileContent = "";
      
      if (fileFormat === "CSV") {
        fileContent = generateCSV(details);
      } else if (fileFormat === "EXCEL") {
        fileContent = generateExcelData(details);
      } else if (fileFormat === "ISO20022") {
        fileContent = generateISO20022(details);
      } else if (fileFormat === "SWIFT_MT940") {
        fileContent = generateSWIFT(details);
      }

      // حفظ الملف في قاعدة البيانات
      const { error: insertError } = await supabase
        .from('bank_transfer_files')
        .insert({
          file_number: fileNumber,
          distribution_id: distributionId,
          file_format: fileFormat,
          total_amount: totalAmount,
          total_transactions: totalTransactions,
          file_content: fileContent,
          status: 'generated',
          generated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      setGeneratedFile({
        fileNumber,
        totalAmount,
        totalTransactions,
        fileContent,
      });

      toast({
        title: "تم بنجاح",
        description: `تم توليد ملف التحويل ${fileNumber}`,
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error generating transfer file:', error);
      toast({
        title: "خطأ",
        description: "فشل توليد ملف التحويل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedFile) return;

    const blob = new Blob([generatedFile.fileContent], { 
      type: fileFormat === "CSV" ? "text/csv" : "text/plain" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedFile.fileNumber}.${fileFormat.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "تم التنزيل",
      description: "تم تنزيل ملف التحويل البنكي",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          توليد ملف التحويل البنكي
        </CardTitle>
        <CardDescription>
          تصدير التحويلات بصيغة متوافقة مع الأنظمة البنكية
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">صيغة الملف</label>
          <Select value={fileFormat} onValueChange={(value: any) => setFileFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">CSV - ملف نصي مفصول بفواصل</SelectItem>
              <SelectItem value="EXCEL">Excel - جدول بيانات</SelectItem>
              <SelectItem value="ISO20022">ISO20022 - معيار دولي</SelectItem>
              <SelectItem value="SWIFT_MT940">SWIFT MT940 - معيار سويفت</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!generatedFile ? (
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            توليد الملف
          </Button>
        ) : (
          <>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">رقم الملف: {generatedFile.fileNumber}</p>
                  <p>عدد التحويلات: {generatedFile.totalTransactions}</p>
                  <p>إجمالي المبلغ: {generatedFile.totalAmount.toFixed(2)} ر.س</p>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="ml-2 h-4 w-4" />
                تنزيل الملف
              </Button>
              <Button
                variant="outline"
                onClick={() => setGeneratedFile(null)}
                className="flex-1"
              >
                توليد جديد
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// دوال مساعدة لتوليد محتوى الملفات
function generateCSV(details: any[]): string {
  const headers = "اسم المستفيد,رقم الآيبان,البنك,المبلغ,البيان\n";
  const rows = details.map(d => 
    `"${d.beneficiaries?.full_name || ''}","${d.beneficiaries?.iban || ''}","${d.beneficiaries?.bank_name || ''}",${d.allocated_amount},"${d.notes || ''}"`
  ).join("\n");
  return headers + rows;
}

function generateExcelData(details: any[]): string {
  // نفس CSV لكن سيتم تحويله لـ Excel في المستقبل
  return generateCSV(details);
}

function generateISO20022(details: any[]): string {
  // XML format for ISO20022
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">\n';
  xml += '  <CstmrCdtTrfInitn>\n';
  details.forEach((d, i) => {
    xml += `    <PmtInf>\n`;
    xml += `      <PmtInfId>${i + 1}</PmtInfId>\n`;
    xml += `      <Cdtr><Nm>${d.beneficiaries?.full_name || ''}</Nm></Cdtr>\n`;
    xml += `      <CdtrAcct><Id><IBAN>${d.beneficiaries?.iban || ''}</IBAN></Id></CdtrAcct>\n`;
    xml += `      <InstdAmt Ccy="SAR">${d.allocated_amount}</InstdAmt>\n`;
    xml += `    </PmtInf>\n`;
  });
  xml += '  </CstmrCdtTrfInitn>\n';
  xml += '</Document>';
  return xml;
}

function generateSWIFT(details: any[]): string {
  // SWIFT MT940 format
  let swift = ":20:Transfer File\n";
  swift += `:25:Waqf Account\n`;
  details.forEach((d, i) => {
    swift += `:61:${d.allocated_amount}SAR\n`;
    swift += `:86:${d.beneficiaries?.full_name || ''}\n`;
  });
  return swift;
}