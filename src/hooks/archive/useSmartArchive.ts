import { useState, useCallback, useRef } from "react";
import { ArchiveService } from "@/services";
import { useToast } from "@/hooks/ui/use-toast";

export function useSmartArchive() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleOCRScan = useCallback(async () => {
    setIsProcessing(true);
    setOcrProgress(0);

    // تنظيف أي interval سابق
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      intervalRef.current = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 100) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      await ArchiveService.invokeOCR('scan_all');

      toast({
        title: "اكتمل المسح الضوئي",
        description: "تم استخراج النص من جميع المستندات",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل معالجة المستند';
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: errorMessage,
      });
    } finally {
      // تنظيف مضمون في finally
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsProcessing(false);
    }
  }, [toast]);

  const handleSmartSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال نص للبحث",
      });
      return [];
    }

    try {
      const results = await ArchiveService.smartSearch(searchQuery, 'text');

      toast({
        title: "نتائج البحث",
        description: `تم العثور على ${results.length} مستند`,
      });

      return results;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'فشل البحث الذكي';
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: errorMessage,
      });
      return [];
    }
  }, [searchQuery, toast]);

  return {
    searchQuery,
    setSearchQuery,
    isProcessing,
    ocrProgress,
    handleOCRScan,
    handleSmartSearch,
  };
}
