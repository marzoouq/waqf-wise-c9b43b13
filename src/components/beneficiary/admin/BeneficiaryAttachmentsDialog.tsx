import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { UnifiedFileUpload, UploadedFile } from "@/components/unified/UnifiedFileUpload";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Beneficiary } from "@/types/beneficiary";
import { Loader2 } from "lucide-react";
import { productionLogger } from "@/lib/logger/production-logger";
import { useBeneficiaryAttachments } from "@/hooks/beneficiary/useBeneficiaryAttachments";

interface BeneficiaryAttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary | null;
}

export function BeneficiaryAttachmentsDialog({
  open,
  onOpenChange,
  beneficiary,
}: BeneficiaryAttachmentsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { attachments: existingAttachments, isLoading } = useBeneficiaryAttachments(beneficiary?.id);

  const handleUpload = async (files: File[]) => {
    if (!beneficiary?.id) return;

    setIsUploading(true);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${beneficiary.id}/${Date.now()}.${fileExt}`;

        // رفع الملف إلى Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('beneficiary-attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // حفظ البيانات في قاعدة البيانات
        const { error: dbError } = await supabase
          .from('beneficiary_attachments')
          .insert({
            beneficiary_id: beneficiary.id,
            file_name: file.name,
            file_path: fileName,
            file_type: file.type.split('/')[0] || 'document',
            file_size: file.size,
            mime_type: file.type,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: "تم الرفع بنجاح",
        description: `تم رفع ${files.length} ملف`,
      });

      queryClient.invalidateQueries({ queryKey: ['beneficiary-attachments', beneficiary.id] });
      setUploadedFiles([]);
    } catch (error) {
      productionLogger.error('Error uploading files', error);
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء رفع الملفات",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, filePath: string) => {
    try {
      // حذف الملف من Storage
      const { error: storageError } = await supabase.storage
        .from('beneficiary-attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      // حذف السجل من قاعدة البيانات
      const { error: dbError } = await supabase
        .from('beneficiary_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) throw dbError;

      toast({
        title: "تم الحذف",
        description: "تم حذف المرفق بنجاح",
      });

      queryClient.invalidateQueries({ queryKey: ['beneficiary-attachments', beneficiary?.id] });
    } catch (error) {
      productionLogger.error('Error deleting attachment', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المرفق",
        variant: "destructive",
      });
    }
  };

  if (!beneficiary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>مرفقات المستفيد: {beneficiary.full_name}</DialogTitle>
          <DialogDescription>
            إدارة وعرض المستندات والمرفقات الخاصة بالمستفيد
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* قسم رفع الملفات */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">رفع مستندات جديدة</h3>
            <UnifiedFileUpload
              accept="image/*,.pdf,.doc,.docx"
              multiple
              maxSize={10}
              maxFiles={5}
              value={uploadedFiles}
              onChange={setUploadedFiles}
              onUpload={handleUpload}
              variant="default"
              dragDropText="اسحب المستندات هنا أو انقر للاختيار"
              browseText="اختر ملفات"
            />
          </div>

          {/* قسم المرفقات الموجودة */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">المرفقات الموجودة</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : existingAttachments && existingAttachments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {existingAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attachment.file_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.file_size / 1024 / 1024).toFixed(2)} ميجابايت
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(attachment.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(attachment.id, attachment.file_path)}
                        className="text-destructive hover:text-destructive"
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                لا توجد مرفقات
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
