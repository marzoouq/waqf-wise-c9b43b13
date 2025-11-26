import { ReactNode, useEffect, useState } from 'react';

interface LazyTabContentProps {
  isActive: boolean;
  children: ReactNode;
}

/**
 * مكون لتحميل محتوى التبويب فقط عند تفعيله
 * يحسن الأداء بعدم تحميل كل التبويبات مرة واحدة
 */
export function LazyTabContent({ isActive, children }: LazyTabContentProps) {
  const [hasBeenActive, setHasBeenActive] = useState(false);

  useEffect(() => {
    if (isActive && !hasBeenActive) {
      setHasBeenActive(true);
    }
  }, [isActive, hasBeenActive]);

  // لا تحمل المحتوى أبداً إذا لم يتم تفعيل التبويب
  if (!hasBeenActive) {
    return null;
  }

  // احتفظ بالمحتوى محملاً بعد التفعيل الأول
  return <div style={{ display: isActive ? 'block' : 'none' }}>{children}</div>;
}
