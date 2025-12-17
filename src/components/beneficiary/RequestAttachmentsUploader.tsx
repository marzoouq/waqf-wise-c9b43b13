import { useState } from "react";
import { useRequestAttachments } from "@/hooks/requests/useRequestAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Paperclip, Upload, Trash2, FileText, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBytes } from "@/lib/utils";
import { useDeleteConfirmation } from "@/hooks/shared/useDeleteConfirmation";
import { DeleteConfirmDialog } from "@/components/shared/DeleteConfirmDialog";

interface RequestAttachmentsUploaderProps {
  requestId: string;
  attachmentsCount?: number;
}

export function RequestAttachmentsUploader({
  requestId,
  attachmentsCount = 0,
}: RequestAttachmentsUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
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

  const handleUpload = async () => {
    if (!selectedFile) return;

    await uploadAttachment({
      file: selectedFile,
      description: description || undefined,
    });

    setSelectedFile(null);
    setDescription("");
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    return "📎";
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Paperclip className="h-4 w-4" />
          <span>المرفقات</span>
          {attachmentsCount > 0 && (
            <Badge variant="secondary" className="me-1">
              {attachmentsCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>مرفقات الطلب</DialogTitle>
          <DialogDescription>
            رفع وإدارة المرفقات المتعلقة بهذا الطلب
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Section */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-sm">رفع مرفق جديد</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="file">اختر ملف</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {getFileIcon(selectedFile.type)} {selectedFile.name} (
                    {formatBytes(selectedFile.size)})
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="description">وصف المرفق (اختياري)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مثال: صورة الهوية الوطنية"
                />
              </div>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 ms-2" />
                {isUploading ? "جاري الرفع..." : "رفع المرفق"}
              </Button>
            </div>
          </div>

          {/* Attachments List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">
              المرفقات الحالية ({attachments.length})
            </h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  جاري التحميل...
                </p>
              ) : attachments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">لا توجد مرفقات</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">
                          {getFileIcon(attachment.file_type)}
                        </span>
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
                            {new Date(attachment.uploaded_at).toLocaleDateString(
                              "ar-SA"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(attachment.file_path, "_blank")}
                          title="معاينة"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = attachment.file_path;
                            link.download = attachment.file_name;
                            link.click();
                          }}
                          title="تحميل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(attachment.id, attachment.file_name)}
                          title="حذف"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <DeleteConfirmDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={executeDelete}
      title="حذف المرفق"
      description="هل أنت متأكد من حذف هذا المرفق؟"
      itemName={itemName}
      isLoading={isDeleting}
    />
    </>
  );
}
