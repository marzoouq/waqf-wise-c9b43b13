import { Badge } from "@/components/ui/badge";
import { useNewAuditLogsCount, useCriticalAuditLogsCount } from "@/hooks/system/useNewAuditLogsCount";
import { cn } from "@/lib/utils";

interface AuditLogsBadgeProps {
  showCritical?: boolean;
  className?: string;
}

export function AuditLogsBadge({ showCritical = false, className }: AuditLogsBadgeProps) {
  const { data: newCount = 0 } = useNewAuditLogsCount();
  const { data: criticalCount = 0 } = useCriticalAuditLogsCount();

  const count = showCritical ? criticalCount : newCount;

  if (count === 0) return null;

  return (
    <Badge 
      variant={showCritical ? "destructive" : "secondary"}
      className={cn(
        "min-w-[20px] h-5 px-1.5 text-[10px] font-bold",
        showCritical && criticalCount > 0 && "animate-pulse",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}

/**
 * نسخة صغيرة من الـ Badge للأماكن الضيقة
 */
export function AuditLogsBadgeMini({ className }: { className?: string }) {
  const { data: criticalCount = 0 } = useCriticalAuditLogsCount();

  if (criticalCount === 0) return null;

  return (
    <span 
      className={cn(
        "inline-flex items-center justify-center w-2 h-2 rounded-full bg-destructive animate-pulse",
        className
      )}
    />
  );
}
