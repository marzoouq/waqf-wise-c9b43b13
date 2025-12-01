import { ReactNode } from 'react';
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
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

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
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full',
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn(sizeClasses[size], 'max-h-[90vh] overflow-y-auto', className)}>
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