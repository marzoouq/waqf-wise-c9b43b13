import { useState } from "react";
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { StorageService, DistributionService } from "@/services";
import { logger } from "@/lib/logger";

interface BankStatementUploadProps {
  disclosureId: string;
  onUploadComplete?: (url: string) => void;
}

export function BankStatementUpload({ disclosureId, onUploadComplete }: BankStatementUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يُرجى رفع ملف PDF أو صورة فقط",
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (أقصى 10 ميجا)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "الملف كبير جداً",
        description: "يُرجى رفع ملف أصغر من 10 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadStatus("idle");

    try {
      // إنشاء اسم ملف فريد
      const fileExt = file.name.split('.').pop();
      const fileName = `${disclosureId}_${Date.now()}.${fileExt}`;
      const filePath = `bank-statements/${fileName}`;

      // رفع الملف إلى Storage
      const uploadResult = await StorageService.uploadFile('documents', filePath, file);

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'فشل الرفع');
      }

      // تحديث الإفصاح بالرابط
      await DistributionService.uploadBankStatement(disclosureId, file);

      setUploadStatus("success");
      toast({
        title: "تم رفع كشف الحساب",
        description: "تم رفع كشف الحساب البنكي بنجاح",
      });

      onUploadComplete?.(uploadResult.url || '');
    } catch (error: unknown) {
      logger.error(error, { 
        context: 'upload_bank_statement', 
        severity: 'medium',
        metadata: { disclosureId }
      });
      setUploadStatus("error");
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء رفع كشف الحساب";
      toast({
        title: "فشل الرفع",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          كشف الحساب البنكي
        </CardTitle>
        <CardDescription>
          ارفع كشف الحساب البنكي للسنة المالية (PDF أو صورة)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label htmlFor="bank-statement" className="sr-only">
              رفع كشف الحساب
            </Label>
            <Input
              id="bank-statement"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/jpg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            {uploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {uploadStatus === "success" && <CheckCircle2 className="h-5 w-5 text-success" />}
            {uploadStatus === "error" && <XCircle className="h-5 w-5 text-destructive" />}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>• الأنواع المدعومة: PDF, JPG, PNG</p>
            <p>• الحد الأقصى للحجم: 10 ميجابايت</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
