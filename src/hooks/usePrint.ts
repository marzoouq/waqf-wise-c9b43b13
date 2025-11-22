import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export const usePrint = () => {
  const print = useCallback((elementId?: string) => {
    try {
      if (elementId) {
        const element = document.getElementById(elementId);
        if (!element) {
          throw new Error("عنصر الطباعة غير موجود");
        }
      }
      
      window.print();
      
      toast({
        title: "جاري الطباعة",
        description: "يتم تجهيز المستند للطباعة...",
      });
    } catch (error) {
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء محاولة الطباعة",
        variant: "destructive",
      });
    }
  }, []);

  const printWithData = useCallback((data: any, templateRenderer: (data: any) => JSX.Element) => {
    try {
      // إنشاء عنصر مؤقت للطباعة
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        throw new Error("فشل فتح نافذة الطباعة");
      }

      // إنشاء المحتوى
      const content = templateRenderer(data);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>طباعة</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
      
      toast({
        title: "جاري الطباعة",
        description: "يتم تجهيز المستند للطباعة...",
      });
    } catch (error) {
      toast({
        title: "خطأ في الطباعة",
        description: "حدث خطأ أثناء محاولة الطباعة",
        variant: "destructive",
      });
    }
  }, []);

  return { print, printWithData };
};
