import { useState, useCallback } from "react";
import { ArchiveService } from "@/services";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface UseDocumentPreviewOptions {
  document: {
    name: string;
    file_path: string;
  } | null;
}

export function useDocumentPreview({ document }: UseDocumentPreviewOptions) {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!document) return;

    try {
      setLoading(true);
      
      const fileName = document.file_path.split('/').pop() || document.name;
      const data = await ArchiveService.downloadFile('beneficiary-documents', fileName);

      const url = URL.createObjectURL(data);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('تم تحميل الملف بنجاح');
    } catch (error: unknown) {
      logger.error(error, { context: 'download_document', severity: 'medium' });
      toast.error('فشل تحميل الملف');
    } finally {
      setLoading(false);
    }
  }, [document]);

  return {
    loading,
    handleDownload,
  };
}
