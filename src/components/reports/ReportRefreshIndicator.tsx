import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { memo } from "react";

interface ReportRefreshIndicatorProps {
  lastUpdated?: Date;
  isRefetching?: boolean;
  onRefresh: () => void;
}

export const ReportRefreshIndicator = memo(function ReportRefreshIndicator({
  lastUpdated,
  isRefetching,
  onRefresh,
}: ReportRefreshIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {lastUpdated && (
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          آخر تحديث: {format(lastUpdated, "HH:mm:ss", { locale: ar })}
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isRefetching}
        className="h-7 px-2"
      >
        <RefreshCw className={`h-3 w-3 ml-1 ${isRefetching ? "animate-spin" : ""}`} />
        {isRefetching ? "جاري التحديث..." : "تحديث"}
      </Button>
    </div>
  );
});
