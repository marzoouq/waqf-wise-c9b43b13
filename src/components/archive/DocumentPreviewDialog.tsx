import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: {
    id: string;
    name: string;
    file_type: string;
    file_path: string;
  } | null;
}

export function DocumentPreviewDialog({
  open,
  onOpenChange,
  document,
}: DocumentPreviewDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!document) return null;

  const handleDownload = async () => {
    try {
      setLoading(true);
      
      // استخراج اسم الملف من المسار
      const fileName = document.file_path.split('/').pop() || document.name;
      
      // تحميل الملف من Supabase Storage
      const { data, error } = await supabase.storage
        .from('beneficiary-documents')
        .download(fileName);

      if (error) throw error;

      // إنشاء رابط تحميل
      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('تم تحميل الملف بنجاح');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error('فشل تحميل الملف');
    } finally {
      setLoading(false);
    }
  };

  const getPreviewContent = () => {
    const fileType = document.file_type.toLowerCase();
    const fileName = document.file_path.split('/').pop() || '';

    // معاينة PDF
    if (fileType === 'pdf' || fileName.endsWith('.pdf')) {
      return (
        <iframe
          src={document.file_path}
          className="w-full h-[600px] rounded-lg border"
          title={document.name}
        />
      );
    }

    // معاينة الصور
    if (
      fileType === 'jpg' ||
      fileType === 'jpeg' ||
      fileType === 'png' ||
      fileType === 'gif' ||
      fileType === 'webp' ||
      fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    ) {
      return (
        <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
          <img
            src={document.file_path}
            alt={document.name}
            className="max-h-[600px] max-w-full object-contain rounded-lg"
          />
        </div>
      );
    }

    // للملفات الأخرى (Word, Excel, etc.)
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/50 rounded-lg min-h-[400px]">
        <div className="p-6 bg-primary/10 rounded-full mb-6">
          {fileType.includes('word') || fileType.includes('doc') ? (
            <FileText className="h-16 w-16 text-primary" />
          ) : (
            <ImageIcon className="h-16 w-16 text-primary" />
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2">{document.name}</h3>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          لا يمكن معاينة هذا النوع من الملفات في المتصفح.
          <br />
          يرجى تحميل الملف لعرضه.
        </p>
        <Button onClick={handleDownload} disabled={loading} size="lg">
          <Download className="ml-2 h-5 w-5" />
          تحميل الملف
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              معاينة المستند
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={loading}
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {document.name} • {document.file_type}
          </p>
        </DialogHeader>

        <div className="mt-4">{getPreviewContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
