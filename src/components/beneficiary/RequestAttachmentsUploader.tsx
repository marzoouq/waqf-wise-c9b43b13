/**
 * مكون عرض وإدارة مرفقات الطلب
 * @version 2.0.0
 * - عرض مباشر للمرفقات بدلاً من زر فتح حوار
 * - دعم رفع وحذف ومعاينة وتحميل المرفقات
 */

import { useState } from "react";
import { useRequestAttachments } from "@/hooks/requests/useRequestAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Paperclip, 
  Upload, 
  Trash2, 
  FileText, 
  Download, 
  Eye,
  File,
  Image,
  FileSpreadsheet,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import { useDeleteConfirmation } from "@/hooks/shared/useDeleteConfirmation";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";
import { toast } from "sonner";

interface RequestAttachmentsUploaderProps {
  requestId: string;
  attachmentsCount?: number;
  /** عرض في وضع مضمن (مباشرة) بدلاً من زر فتح حوار */
  inline?: boolean;
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5 text-red-500" />,
  image: <Image className="h-5 w-5 text-blue-500" />,
  document: <FileSpreadsheet className="h-5 w-5 text-green-500" />,
  default: <File className="h-5 w-5 text-muted-foreground" />,
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return FILE_TYPE_ICONS.pdf;
  if (fileType.includes("image")) return FILE_TYPE_ICONS.image;
  if (fileType.includes("word") || fileType.includes("document")) return FILE_TYPE_ICONS.document;
  return FILE_TYPE_ICONS.default;
};

export function RequestAttachmentsUploader({
  requestId,
  attachmentsCount = 0,
  inline = false,
}: RequestAttachmentsUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { attachments, isLoading, uploadAttachment, deleteAttachment, isUploading } =
    useRequestAttachments(requestId);

  const {
    confirmDelete,
    isOpen: deleteDialogOpen,
    onOpenChange: setDeleteDialogOpen,
    executeDelete,
    isDeleting,
    itemName,
  } = useDeleteConfirmation({
    onDelete: deleteAttachment,
    successMessage: "تم حذف المرفق بنجاح",
    errorMessage: "حدث خطأ أثناء حذف المرفق",
    title: "حذف المرفق",
    description: "هل أنت متأكد من حذف هذا المرفق؟",
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadAttachment({
        file: selectedFile,
        description: description || undefined,
      });
      setSelectedFile(null);
      setDescription("");
      toast.success("تم رفع المرفق بنجاح");
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع المرفق");
    }
  };

  const handlePreview = (filePath: string) => {
    window.open(filePath, "_blank");
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    link.click();
  };

  // المحتوى المضمن
  const content = (
    <div className="space-y-6">
      {/* منطقة الرفع */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Upload className="h-5 w-5" />
            رفع مرفق جديد
          </CardTitle>
          <CardDescription>
            الملفات المدعومة: PDF, Word, صور (حد أقصى 10 ميغابايت)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* منطقة السحب والإفلات */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                {getFileIcon(selectedFile.type)}
                <div className="text-right">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatBytes(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-destructive"
                >
                  إلغاء
                </Button>
              </div>
            ) : (
              <div>
                <Paperclip className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground mb-2">
                  اسحب الملف هنا أو
                </p>
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>اختر ملف</span>
                  </Button>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* وصف المرفق */}
          {selectedFile && (
            <div className="space-y-2">
              <Label htmlFor="description">وصف المرفق (اختياري)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: صورة الهوية الوطنية"
              />
            </div>
          )}

          {/* زر الرفع */}
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 ms-2 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 ms-2" />
                  رفع المرفق
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* قائمة المرفقات */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              المرفقات الحالية
            </span>
            <Badge variant="secondary">{attachments.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-muted/20">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">لا توجد مرفقات</p>
              <p className="text-xs text-muted-foreground mt-1">
                ارفع المستندات الداعمة لطلبك
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(attachment.file_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {attachment.file_name}
                        </p>
                        {attachment.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {attachment.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(attachment.file_size)} •{" "}
                          {new Date(attachment.uploaded_at).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreview(attachment.file_path)}
                        title="معاينة"
                        className="h-8 w-8"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(attachment.file_path, attachment.file_name)}
                        title="تحميل"
                        className="h-8 w-8"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(attachment.id, attachment.file_name)}
                        title="حذف"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={executeDelete}
        title="حذف المرفق"
        description="هل أنت متأكد من حذف هذا المرفق؟"
        itemName={itemName}
        isLoading={isDeleting}
      />
    </div>
  );

  // إذا كان الوضع مضمن، نعرض المحتوى مباشرة
  if (inline) {
    return content;
  }

  // وضع الزر (للتوافق مع الاستخدام القديم)
  return (
    <Button variant="outline" size="sm" className="gap-2">
      <Paperclip className="h-4 w-4" />
      <span>المرفقات</span>
      {attachmentsCount > 0 && (
        <Badge variant="secondary" className="me-1">
          {attachmentsCount}
        </Badge>
      )}
    </Button>
  );
}
