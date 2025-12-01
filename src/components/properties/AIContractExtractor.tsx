import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, FileText, Upload } from "lucide-react";
import { useAIExtraction } from "@/hooks/useAIExtraction";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContractInsert } from "@/types/contracts";
import { useToast } from "@/hooks/use-toast";

interface Props {
  onExtracted: (data: Partial<ContractInsert>) => void;
}

export const AIContractExtractor = ({ onExtracted }: Props) => {
  const [text, setText] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const { extractData, isExtracting } = useAIExtraction();
  const { toast } = useToast();

  const handleExtract = async () => {
    if (!text.trim()) {
      toast({
        title: "النص فارغ",
        description: "يرجى إدخال نص العقد أو لصقه",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = await extractData(text, 'contract');
      setExtractedData(data);
    } catch (error) {
      console.error("خطأ في الاستخراج:", error);
    }
  };

  const handleUseData = () => {
    if (!extractedData) return;

    // تحويل البيانات إلى الصيغة المطلوبة
    const contractData: Partial<ContractInsert> = {
      contract_number: extractedData.contract_number || `CNT-${Date.now()}`,
      tenant_name: extractedData.tenant_name,
      tenant_id_number: extractedData.tenant_id_number,
      tenant_phone: extractedData.tenant_phone,
      tenant_email: extractedData.tenant_email,
      contract_type: extractedData.contract_type,
      start_date: extractedData.start_date,
      end_date: extractedData.end_date,
      monthly_rent: extractedData.monthly_rent || (extractedData.annual_rent / 12),
      security_deposit: extractedData.security_deposit || 0,
      payment_frequency: extractedData.payment_frequency,
      is_renewable: extractedData.is_renewable ?? true,
      units_count: extractedData.units_count,
      terms_and_conditions: extractedData.terms_and_conditions,
      notes: extractedData.notes,
    };

    onExtracted(contractData);
    
    // إعادة تعيين الحالة
    setText("");
    setExtractedData(null);
    
    toast({
      title: "تم نقل البيانات",
      description: "تم نقل البيانات المستخرجة إلى النموذج. يمكنك المراجعة والتعديل قبل الحفظ.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('text/')) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى رفع ملف PDF أو نصي",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = await file.text();
      setText(content);
      toast({
        title: "تم رفع الملف",
        description: "تم قراءة محتوى الملف بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في القراءة",
        description: "فشل في قراءة محتوى الملف",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">استخراج البيانات بالذكاء الاصطناعي</h3>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          الصق نص العقد أو ارفع ملف PDF/نصي، وسيقوم الذكاء الاصطناعي باستخراج جميع البيانات تلقائياً
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="contract-text">نص العقد</Label>
        <Textarea
          id="contract-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="الصق نص العقد هنا أو استخدم زر رفع ملف..."
          className="min-h-[200px] font-arabic"
          dir="rtl"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleExtract}
          disabled={isExtracting || !text.trim()}
          className="flex-1"
        >
          {isExtracting ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري الاستخراج...
            </>
          ) : (
            <>
              <Sparkles className="ml-2 h-4 w-4" />
              استخراج البيانات
            </>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => document.getElementById('file-upload')?.click()}
          disabled={isExtracting}
        >
          <Upload className="ml-2 h-4 w-4" />
          رفع ملف
        </Button>
        <input
          id="file-upload"
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      {extractedData && (
        <Card className="p-4 bg-muted/50 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">البيانات المستخرجة:</h4>
            <Button onClick={handleUseData} size="sm">
              استخدام البيانات
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(extractedData).map(([key, value]) => {
              if (value === null || value === undefined) return null;
              const label = {
                tenant_name: "اسم المستأجر",
                tenant_id_number: "رقم الهوية",
                tenant_phone: "الجوال",
                contract_type: "نوع العقد",
                start_date: "تاريخ البداية",
                end_date: "تاريخ النهاية",
                monthly_rent: "الإيجار الشهري",
                annual_rent: "الإيجار السنوي",
                security_deposit: "التأمين",
                payment_frequency: "تكرار الدفع",
              }[key] || key;
              
              return (
                <div key={key} className="space-y-1">
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium">{String(value)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </Card>
  );
};
