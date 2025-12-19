import { useCallback, type JSX } from "react";
import { toast } from "@/hooks/ui/use-toast";
import { renderToStaticMarkup } from "react-dom/server";
import DOMPurify from "dompurify";

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

  const printWithData = useCallback(<T,>(
    data: T, 
    templateRenderer: (data: T) => JSX.Element
  ) => {
    try {
      // إنشاء نافذة جديدة للطباعة
      const printWindow = window.open('', '', 'width=800,height=600');
      if (!printWindow) {
        throw new Error("فشل فتح نافذة الطباعة");
      }

      // تحويل JSX إلى HTML string
      const jsxContent = templateRenderer(data);
      const htmlString = renderToStaticMarkup(jsxContent);
      
      // تنظيف المحتوى من أي كود ضار
      const sanitizedContent = DOMPurify.sanitize(htmlString, {
        ALLOWED_TAGS: [
          'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'ul', 'ol', 'li', 'br', 'hr', 'strong', 'b', 'em', 'i',
          'img', 'a', 'header', 'footer', 'section', 'article', 'style'
        ],
        ALLOWED_ATTR: [
          'class', 'id', 'style', 'src', 'alt', 'href', 'colspan', 'rowspan',
          'width', 'height', 'align', 'valign', 'border', 'cellpadding', 'cellspacing'
        ],
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
        FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
      });
      
      // إنشاء المستند باستخدام DOM API الآمن
      const doc = printWindow.document;
      doc.open();
      
      // إنشاء البنية الأساسية
      const html = doc.createElement('html');
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      
      const head = doc.createElement('head');
      const meta = doc.createElement('meta');
      meta.setAttribute('charset', 'utf-8');
      head.appendChild(meta);
      
      const title = doc.createElement('title');
      title.textContent = 'طباعة';
      head.appendChild(title);
      
      const style = doc.createElement('style');
      style.textContent = `
        body { 
          font-family: 'Segoe UI', Tahoma, Arial, sans-serif; 
          direction: rtl; 
          padding: 20px;
          line-height: 1.6;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: right;
        }
        th { 
          background-color: #f5f5f5; 
          font-weight: bold;
        }
        .print-template {
          display: block !important;
        }
        @media print { 
          body { margin: 0; }
          @page { margin: 1cm; }
        }
      `;
      head.appendChild(style);
      
      const body = doc.createElement('body');
      body.innerHTML = sanitizedContent;
      
      html.appendChild(head);
      html.appendChild(body);
      
      doc.appendChild(html);
      doc.close();
      
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
