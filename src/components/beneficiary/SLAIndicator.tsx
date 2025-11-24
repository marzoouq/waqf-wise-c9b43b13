import { Clock, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SLAIndicatorProps {
  slaDueAt?: string | null;
  status: string;
  className?: string;
  showLabel?: boolean;
}

export function SLAIndicator({
  slaDueAt,
  status,
  className,
  showLabel = true,
}: SLAIndicatorProps) {
  if (!slaDueAt) return null;

  const now = new Date();
  const dueDate = new Date(slaDueAt);
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  // If completed, show success
  if (status === "معتمد" || status === "مكتمل" || status === "مرفوض") {
    return showLabel ? (
      <Badge variant="outline" className={cn("gap-1 text-green-600", className)}>
        <CheckCircle className="h-3 w-3" />
        <span>مكتمل</span>
      </Badge>
    ) : (
      <CheckCircle className={cn("h-4 w-4 text-green-600", className)} />
    );
  }

  // Overdue (red)
  if (diffMs < 0) {
    const hoursOverdue = Math.abs(diffHours);
    return showLabel ? (
      <Badge variant="destructive" className={cn("gap-1", className)}>
        <AlertCircle className="h-3 w-3" />
        <span>متأخر {hoursOverdue} ساعة</span>
      </Badge>
    ) : (
      <AlertCircle className={cn("h-4 w-4 text-destructive", className)} />
    );
  }

  // Less than 6 hours remaining (yellow/warning)
  if (diffHours < 6) {
    return showLabel ? (
      <Badge
        variant="outline"
        className={cn("gap-1 border-yellow-500 text-yellow-600", className)}
      >
        <Clock className="h-3 w-3" />
        <span>
          {diffHours > 0
            ? `${diffHours} ساعة ${diffMinutes} دقيقة`
            : `${diffMinutes} دقيقة`}
        </span>
      </Badge>
    ) : (
      <Clock className={cn("h-4 w-4 text-yellow-600", className)} />
    );
  }

  // More than 6 hours remaining (green)
  return showLabel ? (
    <Badge variant="outline" className={cn("gap-1 text-green-600", className)}>
      <Clock className="h-3 w-3" />
      <span>
        {diffHours > 24
          ? `${Math.floor(diffHours / 24)} يوم`
          : `${diffHours} ساعة`}
      </span>
    </Badge>
  ) : (
    <Clock className={cn("h-4 w-4 text-green-600", className)} />
  );
}
