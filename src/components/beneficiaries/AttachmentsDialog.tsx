import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBeneficiaryAttachments } from "@/hooks/useBeneficiaryAttachments";
import { Upload, FileText, Trash2, Download, CheckCircle, XCircle } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface AttachmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaryId: string;
  beneficiaryName: string;
}

export function AttachmentsDialog({ open, onOpenChange, beneficiaryId, beneficiaryName }: AttachmentsDialogProps) {
  const { attachments, isLoading, addAttachment, deleteAttachment } = useBeneficiaryAttachments(beneficiaryId);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    file_name: "",
    file_path: "",
    file_type: "",
    description: "",
  });

  const fileTypes = [
    { value: "identity", label: "بطاقة الهوية" },
    { value: "birth_certificate", label: "شهادة ميلاد" },
    { value: "marriage_certificate", label: "عقد زواج" },
    { value: "bank_document", label: "مستند بنكي" },
    { value: "medical", label: "تقرير طبي" },
    { value: "other", label: "أخرى" },
  ];

  const handleSubmit = async () => {
    if (!formData.file_name || !formData.file_path || !formData.file_type) return;

    await addAttachment({
      beneficiary_id: beneficiaryId,
      ...formData,
      file_size: 0,
      is_verified: false,
    });

    setFormData({ file_name: "", file_path: "", file_type: "", description: "" });
    setShowUploadForm(false);
  };

  const handleDelete = async (id: string) => {
    await deleteAttachment(id);
    setDeleteConfirm(null);
  };

  const getFileTypeLabel = (type: string) => {
    return fileTypes.find(ft => ft.value === type)?.label || type;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>مرفقات ومستندات: {beneficiaryName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={() => setShowUploadForm(!showUploadForm)} className="w-full">
              <Upload className="ml-2 h-4 w-4" />
              {showUploadForm ? "إخفاء نموذج الرفع" : "رفع مرفق جديد"}
            </Button>

            {showUploadForm && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName">اسم الملف</Label>
                  <Input
                    id="fileName"
                    placeholder="أدخل اسم الملف..."
                    value={formData.file_name}
                    onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filePath">مسار الملف</Label>
                  <Input
                    id="filePath"
                    placeholder="أدخل مسار الملف..."
                    value={formData.file_path}
                    onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileType">نوع المستند</Label>
                  <Select value={formData.file_type} onValueChange={(value) => setFormData({ ...formData, file_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع المستند" />
                    </SelectTrigger>
                    <SelectContent>
                      {fileTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    placeholder="أدخل وصف المستند..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmit}>رفع المرفق</Button>
                  <Button variant="outline" onClick={() => setShowUploadForm(false)}>إلغاء</Button>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8">جاري التحميل...</div>
            ) : attachments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد مرفقات مسجلة
              </div>
            ) : (
              <div className="space-y-3">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{attachment.file_name}</h4>
                            {attachment.is_verified ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                موثق
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                غير موثق
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{getFileTypeLabel(attachment.file_type)}</p>
                          {attachment.description && (
                            <p className="text-sm">{attachment.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            رفع بواسطة: {attachment.uploaded_by_name} • {format(new Date(attachment.created_at), "dd MMMM yyyy", { locale: ar })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setDeleteConfirm(attachment.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المرفق؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
