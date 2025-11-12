import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, File, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: string;
  onUploadComplete?: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  requestId,
  onUploadComplete,
}: DocumentUploadDialogProps) {
  const { toast } = useToast();
  const [fileType, setFileType] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير",
          description: "الحد الأقصى لحجم الملف هو 10 ميجابايت",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !fileType) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار نوع المستند والملف",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Simulate upload (replace with actual Supabase storage upload)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "تم رفع المستند",
        description: "تم رفع المستند بنجاح",
      });

      // Reset form
      setSelectedFile(null);
      setFileType("");
      setDescription("");
      onOpenChange(false);
      onUploadComplete?.();
    } catch (error) {
      toast({
        title: "خطأ في الرفع",
        description: "حدث خطأ أثناء رفع المستند",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>رفع مستند</DialogTitle>
          <DialogDescription>
            قم برفع المستندات المطلوبة لطلبك
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>نوع المستند *</Label>
            <Select value={fileType} onValueChange={setFileType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المستند" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="هوية">صورة الهوية</SelectItem>
                <SelectItem value="شهادة_ميلاد">شهادة الميلاد</SelectItem>
                <SelectItem value="عقد_زواج">عقد الزواج</SelectItem>
                <SelectItem value="كشف_حساب">كشف حساب بنكي</SelectItem>
                <SelectItem value="تقرير_طبي">تقرير طبي</SelectItem>
                <SelectItem value="فاتورة">فاتورة</SelectItem>
                <SelectItem value="آخر">مستند آخر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>وصف المستند</Label>
            <Textarea
              placeholder="أضف وصفاً للمستند (اختياري)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label>الملف *</Label>
            <div className="mt-2">
              {!selectedFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      اضغط لاختيار ملف
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, JPG, PNG (حتى 10MB)
                    </p>
                  </div>
                  <Input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <File className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile || !fileType}>
              {uploading ? "جاري الرفع..." : "رفع المستند"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}