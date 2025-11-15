import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * مكون بسيط لإظهار تلميح التمرير على الجوال
 * يمكن استخدامه فوق أي جدول أو محتوى قابل للتمرير
 */
export function MobileScrollHint() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // إخفاء التلميح بعد 3 ثواني
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="md:hidden flex justify-center py-2 animate-pulse">
      <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 backdrop-blur-sm rounded-full text-xs text-primary">
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium">اسحب لليمين لرؤية المزيد</span>
        <ChevronLeft className="h-3 w-3" />
      </div>
    </div>
  );
}
