import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { BankFileFormat, DistributionDetail, GeneratedTransferFile } from "@/types/bank-transfer";

interface BankTransferGeneratorProps {
  distributionId: string;
  onSuccess?: () => void;
}

export function BankTransferGenerator({ distributionId, onSuccess }: BankTransferGeneratorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fileFormat, setFileFormat] = useState<BankFileFormat>("CSV");
  const [generatedFile, setGeneratedFile] = useState<GeneratedTransferFile | null>(null);

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

      const typedDetails = details as unknown as DistributionDetail[];

      if (!typedDetails || typedDetails.length === 0) {
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
      const totalAmount = typedDetails.reduce((sum, detail) => sum + detail.allocated_amount, 0);
      const totalTransactions = typedDetails.length;

      // توليد محتوى الملف حسب الصيغة
      let fileContent = "";
      
      if (fileFormat === "CSV") {
        fileContent = generateCSV(typedDetails);
      } else if (fileFormat === "EXCEL") {
        fileContent = generateExcelData(typedDetails);
      } else if (fileFormat === "ISO20022") {
        fileContent = generateISO20022(typedDetails);
      } else if (fileFormat === "SWIFT_MT940") {
        fileContent = generateSWIFT(typedDetails);
      } else if (fileFormat === "SEPA") {
        fileContent = generateSEPA(typedDetails);
      } else if (fileFormat === "ACH") {
        fileContent = generateACH(typedDetails);
      } else if (fileFormat === "BACS") {
        fileContent = generateBACS(typedDetails);
      } else if (fileFormat === "NCB") {
        fileContent = generateNCB(typedDetails);
      } else if (fileFormat === "ALRAJHI") {
        fileContent = generateAlRajhi(typedDetails);
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
          <Select value={fileFormat} onValueChange={(value: BankFileFormat) => setFileFormat(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CSV">CSV - ملف نصي مفصول بفواصل</SelectItem>
              <SelectItem value="EXCEL">Excel - جدول بيانات</SelectItem>
              <SelectItem value="ISO20022">ISO20022 - معيار دولي</SelectItem>
              <SelectItem value="SWIFT_MT940">SWIFT MT940 - معيار سويفت</SelectItem>
              <SelectItem value="SEPA">SEPA - التحويلات الأوروبية</SelectItem>
              <SelectItem value="ACH">ACH - التحويلات الأمريكية</SelectItem>
              <SelectItem value="BACS">BACS - التحويلات البريطانية</SelectItem>
              <SelectItem value="NCB">صيغة البنك الأهلي السعودي</SelectItem>
              <SelectItem value="ALRAJHI">صيغة بنك الراجحي</SelectItem>
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
function generateCSV(details: DistributionDetail[]): string {
  const headers = "اسم المستفيد,رقم الآيبان,البنك,المبلغ,البيان\n";
  const rows = details.map(d => 
    `"${d.beneficiaries?.full_name || ''}","${d.beneficiaries?.iban || ''}","${d.beneficiaries?.bank_name || ''}",${d.allocated_amount},"${d.notes || ''}"`
  ).join("\n");
  return headers + rows;
}

function generateExcelData(details: DistributionDetail[]): string {
  // نفس CSV لكن سيتم تحويله لـ Excel في المستقبل
  return generateCSV(details);
}

function generateISO20022(details: DistributionDetail[]): string {
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

function generateSWIFT(details: DistributionDetail[]): string {
  // SWIFT MT940 format
  let swift = ":20:Transfer File\n";
  swift += `:25:Waqf Account\n`;
  details.forEach((d) => {
    swift += `:61:${d.allocated_amount}SAR\n`;
    swift += `:86:${d.beneficiaries?.full_name || ''}\n`;
  });
  return swift;
}

// صيغة SEPA (Single Euro Payments Area)
function generateSEPA(details: DistributionDetail[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">\n';
  xml += '  <CstmrDrctDbtInitn>\n';
  xml += '    <GrpHdr>\n';
  xml += `      <MsgId>WAQF${Date.now()}</MsgId>\n`;
  xml += `      <CreDtTm>${new Date().toISOString()}</CreDtTm>\n`;
  xml += `      <NbOfTxs>${details.length}</NbOfTxs>\n`;
  const totalAmount = details.reduce((sum, d) => sum + d.allocated_amount, 0);
  xml += `      <CtrlSum>${totalAmount.toFixed(2)}</CtrlSum>\n`;
  xml += '    </GrpHdr>\n';
  
  details.forEach((d, i) => {
    xml += '    <PmtInf>\n';
    xml += `      <PmtInfId>PMT${i + 1}</PmtInfId>\n`;
    xml += '      <PmtMtd>TRF</PmtMtd>\n';
    xml += '      <ReqdExctnDt>' + new Date().toISOString().split('T')[0] + '</ReqdExctnDt>\n';
    xml += '      <Cdtr>\n';
    xml += `        <Nm>${d.beneficiaries?.full_name || ''}</Nm>\n`;
    xml += '      </Cdtr>\n';
    xml += '      <CdtrAcct>\n';
    xml += '        <Id>\n';
    xml += `          <IBAN>${d.beneficiaries?.iban || ''}</IBAN>\n`;
    xml += '        </Id>\n';
    xml += '      </CdtrAcct>\n';
    xml += '      <Amt>\n';
    xml += `        <InstdAmt Ccy="SAR">${d.allocated_amount.toFixed(2)}</InstdAmt>\n`;
    xml += '      </Amt>\n';
    xml += '    </PmtInf>\n';
  });
  
  xml += '  </CstmrDrctDbtInitn>\n';
  xml += '</Document>';
  return xml;
}

// صيغة ACH (Automated Clearing House) - أمريكي
function generateACH(details: DistributionDetail[]): string {
  let ach = '';
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '').substring(2);
  
  // File Header
  ach += '101 ';
  ach += '123456789 '; // Immediate Destination
  ach += '987654321 '; // Immediate Origin
  ach += dateStr + ' ';
  ach += today.toTimeString().substring(0, 4).replace(':', '') + ' ';
  ach += 'A'; // File ID Modifier
  ach += '094'; // Record Size
  ach += '10'; // Blocking Factor
  ach += '1'; // Format Code
  ach += 'WAQF SYSTEM        \n';
  
  details.forEach((d, i) => {
    // Entry Detail Record
    ach += '6'; // Record Type
    ach += '22'; // Transaction Code (Checking Credit)
    ach += '123456789 '; // Receiving DFI ID
    ach += (d.beneficiaries?.iban || '').padEnd(17).substring(0, 17);
    ach += d.allocated_amount.toFixed(2).replace('.', '').padStart(10, '0');
    ach += `${i + 1}`.padStart(15, '0'); // Individual ID
    ach += (d.beneficiaries?.full_name || '').padEnd(22).substring(0, 22);
    ach += '  0\n';
  });
  
  return ach;
}

// صيغة BACS (Bankers' Automated Clearing Services) - بريطاني
function generateBACS(details: DistributionDetail[]): string {
  let bacs = '';
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  
  // Header Record
  bacs += 'VOL1';
  bacs += '01';
  bacs += 'WAQFSYS ';
  bacs += dateStr;
  bacs += '\n';
  
  details.forEach((d, i) => {
    // Standard 18 Record
    bacs += '99'; // Destination Sort Code
    bacs += (d.beneficiaries?.iban || '').substring(0, 8).padEnd(8);
    bacs += '0'; // Type
    bacs += '01'; // Transaction Code
    bacs += '123456'; // User Number
    bacs += d.allocated_amount.toFixed(2).replace('.', '').padStart(11, '0');
    bacs += (d.beneficiaries?.full_name || '').padEnd(18).substring(0, 18);
    bacs += `REF${i + 1}`.padEnd(18);
    bacs += '\n';
  });
  
  return bacs;
}

// صيغة البنك الأهلي السعودي (NCB)
function generateNCB(details: DistributionDetail[]): string {
  let ncb = '';
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
  const timeStr = today.toTimeString().substring(0, 8).replace(/:/g, '');
  
  // Header
  ncb += 'H|'; // Record Type
  ncb += 'WAQF|'; // Company ID
  ncb += dateStr + '|';
  ncb += timeStr + '|';
  ncb += `${details.length}|`;
  const totalAmount = details.reduce((sum, d) => sum + d.allocated_amount, 0);
  ncb += totalAmount.toFixed(2) + '|\n';
  
  // Detail Records
  details.forEach((d, i) => {
    ncb += 'D|'; // Record Type
    ncb += `${i + 1}|`; // Sequence
    ncb += (d.beneficiaries?.iban || '') + '|';
    ncb += (d.beneficiaries?.full_name || '') + '|';
    ncb += d.allocated_amount.toFixed(2) + '|';
    ncb += 'SAR|';
    ncb += (d.notes || 'توزيع الوقف') + '|\n';
  });
  
  // Trailer
  ncb += 'T|';
  ncb += `${details.length}|`;
  ncb += totalAmount.toFixed(2) + '|\n';
  
  return ncb;
}

// صيغة بنك الراجحي
function generateAlRajhi(details: DistributionDetail[]): string {
  let rajhi = '';
  const today = new Date();
  const batchId = `WAQF${Date.now()}`;
  
  // File Header
  rajhi += `BATCH_ID=${batchId}\n`;
  rajhi += `DATE=${today.toISOString().split('T')[0]}\n`;
  rajhi += `TIME=${today.toTimeString().substring(0, 8)}\n`;
  rajhi += `TOTAL_RECORDS=${details.length}\n`;
  const totalAmount = details.reduce((sum, d) => sum + d.allocated_amount, 0);
  rajhi += `TOTAL_AMOUNT=${totalAmount.toFixed(2)}\n`;
  rajhi += `CURRENCY=SAR\n`;
  rajhi += '---\n';
  
  // Detail Records (CSV-like for Rajhi)
  rajhi += 'SEQ,IBAN,BENEFICIARY_NAME,AMOUNT,PURPOSE\n';
  details.forEach((d, i) => {
    rajhi += `${i + 1},`;
    rajhi += `"${d.beneficiaries?.iban || ''}",`;
    rajhi += `"${d.beneficiaries?.full_name || ''}",`;
    rajhi += `${d.allocated_amount.toFixed(2)},`;
    rajhi += `"${d.notes || 'توزيع الوقف'}"\n`;
  });
  
  return rajhi;
}