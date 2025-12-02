import { ReactNode, useMemo, useRef } from 'react';
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
 * ✅ يثبت نوع المكون عند أول mount لمنع التبديل
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
  // ✅ تثبيت قيمة isDesktop عند أول mount فقط - لا يتغير أبداً
  const isDesktopRef = useRef<boolean | null>(null);
  if (isDesktopRef.current === null) {
    isDesktopRef.current = getIsDesktop();
  }
  const isDesktop = isDesktopRef.current;

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
