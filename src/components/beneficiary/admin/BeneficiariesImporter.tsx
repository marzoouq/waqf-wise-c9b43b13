import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { BeneficiaryService } from "@/services/beneficiary.service";

const importSchema = z.object({
  full_name: z.string().min(3, "الاسم قصير جداً"),
  national_id: z.string().regex(/^\d{10}$/, "الهوية يجب أن تكون 10 أرقام"),
  phone: z.string().min(10, "رقم الجوال غير صحيح"),
  gender: z.enum(["ذكر", "أنثى"], { errorMap: () => ({ message: "الجنس يجب أن يكون ذكر أو أنثى" }) }),
  relationship: z.string().min(2, "صلة القرابة مطلوبة"),
  category: z.string().default("الدرجة الأولى"),
  nationality: z.string().default("سعودي"),
});

type ImportRow = z.infer<typeof importSchema>;

interface BeneficiariesImporterProps {
  onSuccess: () => void;
}

export function BeneficiariesImporter({ onSuccess }: BeneficiariesImporterProps) {
  const [open, setOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ImportRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Dynamic import for excel-helper
        const { readExcelBuffer } = await import("@/lib/excel-helper");
        
        const jsonData = await readExcelBuffer(e.target?.result as ArrayBuffer);

        const errors: string[] = [];
        const validData: ImportRow[] = [];

        jsonData.forEach((row: Record<string, unknown>, index) => {
          try {
            const validated = importSchema.parse({
              full_name: row['الاسم الكامل'] || row['full_name'],
              national_id: String(row['رقم الهوية'] || row['national_id']),
              phone: String(row['رقم الجوال'] || row['phone']),
              gender: row['الجنس'] || row['gender'],
              relationship: row['صلة القرابة'] || row['relationship'],
              category: row['الفئة'] || row['category'] || 'الدرجة الأولى',
              nationality: row['الجنسية'] || row['nationality'] || 'سعودي',
            });
            validData.push(validated);
          } catch (err) {
            if (err instanceof z.ZodError) {
              errors.push(`الصف ${index + 2}: ${err.errors.map(e => e.message).join(', ')}`);
            }
          }
        });

        setValidationErrors(errors);
        setPreviewData(validData);

        if (validData.length > 0) {
          toast({
            title: "تم تحليل الملف بنجاح",
            description: `تم التحقق من ${validData.length} سجل`,
          });
        }

        if (errors.length > 0) {
          toast({
            title: "تحذير",
            description: `وجدت ${errors.length} خطأ في البيانات`,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من صحة تنسيق ملف Excel",
          variant: "destructive",
        });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;

    setImporting(true);
    try {
      const records = previewData.map(row => ({
        full_name: row.full_name!,
        national_id: row.national_id!,
        phone: row.phone!,
        gender: row.gender!,
        relationship: row.relationship!,
        category: row.category || 'الدرجة الأولى',
        nationality: row.nationality || 'سعودي',
      }));
      await BeneficiaryService.importBeneficiaries(records);

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم إضافة ${previewData.length} مستفيد`,
      });

      setOpen(false);
      setPreviewData([]);
      setValidationErrors([]);
      onSuccess();
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="ml-2 h-4 w-4" />
        استيراد من Excel
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              استيراد مستفيدين من Excel
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label 
                htmlFor="file-upload" 
                className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors"
              >
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    اضغط لاختيار ملف Excel
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    يجب أن يحتوي على: الاسم الكامل، رقم الهوية، رقم الجوال، الجنس، صلة القرابة
                  </p>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-destructive mb-2">
                      أخطاء في البيانات ({validationErrors.length})
                    </h4>
                    <ul className="text-sm space-y-1">
                      {validationErrors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {validationErrors.length > 5 && (
                        <li>... و {validationErrors.length - 5} أخطاء أخرى</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="bg-primary/10 border border-primary rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-primary mb-2">
                      معاينة البيانات ({previewData.length} سجل)
                    </h4>
                    <div className="max-h-60 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0">
                          <tr>
                            <th className="p-2 text-right">الاسم</th>
                            <th className="p-2 text-right">الهوية</th>
                            <th className="p-2 text-right">القرابة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 10).map((row, i) => (
                            <tr key={i} className="border-t">
                              <td className="p-2">{row.full_name}</td>
                              <td className="p-2">{row.national_id}</td>
                              <td className="p-2">{row.relationship}</td>
                            </tr>
                          ))}
                          {previewData.length > 10 && (
                            <tr>
                              <td colSpan={3} className="p-2 text-center text-muted-foreground">
                                ... و {previewData.length - 10} سجلات أخرى
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                إلغاء
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={previewData.length === 0 || importing}
              >
                {importing ? "جاري الاستيراد..." : `استيراد ${previewData.length} سجل`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}