/**
 * زر عائم لإضافة طلب جديد
 * @version 1.0.0
 */

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton = memo(function FloatingActionButton({
  onClick,
  className,
}: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-20 left-4 z-50 h-14 w-14 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-200 hover:scale-110 active:scale-95",
        "md:hidden", // إخفاء في الشاشات الكبيرة
        className
      )}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">طلب جديد</span>
    </Button>
  );
});
