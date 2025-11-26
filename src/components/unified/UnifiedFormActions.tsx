import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnifiedFormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * UnifiedFormActions - أزرار إجراءات النموذج الموحدة
 * توفر تصميماً متسقاً لأزرار الحفظ والإلغاء
 */
export function UnifiedFormActions({
  submitLabel = "حفظ",
  cancelLabel = "إلغاء",
  onCancel,
  isSubmitting = false,
  disabled = false,
  className,
  children,
}: UnifiedFormActionsProps) {
  return (
    <div className={cn("flex items-center gap-3 justify-end", className)}>
      {children}
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
        >
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || disabled}
      >
        {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );
}
