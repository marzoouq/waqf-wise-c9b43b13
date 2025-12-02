import { ReactNode, useMemo, useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

// ✅ نقل sizeClasses خارج المكون (ثابت - لا يتغير)
const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
} as const;

// ✅ دالة للتحقق من حجم الشاشة بدون hook
const getIsDesktop = () => {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 768;
};

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Dialog/Drawer محسّن للجوال
 * يعرض Drawer على الجوال و Dialog على الشاشات الكبيرة
 * ✅ يثبت نوع المكون عند الفتح لمنع التبديل أثناء العرض
 */
export function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description = ' ',
  children,
  className,
  size = 'md',
}: ResponsiveDialogProps) {
  // ✅ تثبيت قيمة isDesktop عند فتح المحاورة لمنع التبديل أثناء العرض
  const [isDesktop, setIsDesktop] = useState(getIsDesktop);
  const wasOpenRef = useRef(false);

  // ✅ تحديث isDesktop فقط عند الفتح (وليس أثناء العرض)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      // عند الفتح لأول مرة، تحديث القيمة
      setIsDesktop(getIsDesktop());
    }
    wasOpenRef.current = open;
  }, [open]);

  // ✅ استخدام useMemo للـ className لمنع إعادة الحساب في كل render
  const dialogClassName = useMemo(() => 
    cn(SIZE_CLASSES[size], 'max-h-[90vh] overflow-y-auto', className),
    [size, className]
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={dialogClassName}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className={cn('max-h-[95vh]', className)}>
        <div className="overflow-y-auto px-4 pb-4">
          <DrawerHeader className="text-right px-0">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * Dialog للنماذج الطويلة
 */
interface ResponsiveFormDialogProps extends ResponsiveDialogProps {
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export function ResponsiveFormDialog({
  onSubmit,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  isLoading,
  children,
  ...props
}: ResponsiveFormDialogProps) {
  return (
    <ResponsiveDialog {...props}>
      <div className="space-y-4">
        {children}
      </div>
    </ResponsiveDialog>
  );
}

/**
 * إعادة تصدير DialogFooter للاستخدام المباشر
 */
export { DialogFooter };
