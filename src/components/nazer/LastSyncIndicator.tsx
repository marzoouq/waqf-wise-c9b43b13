/**
 * مؤشر آخر تحديث
 * يعرض وقت آخر تحديث للبيانات مع إمكانية التحديث اليدوي
 * 
 * @version 2.8.78
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface LastSyncIndicatorProps {
  lastUpdated?: Date | string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
  showLabel?: boolean;
}

export function LastSyncIndicator({
  lastUpdated,
  onRefresh,
  isRefreshing = false,
  className,
  showLabel = true
}: LastSyncIndicatorProps) {
  const [displayTime, setDisplayTime] = useState<string>("");
  const [isRecent, setIsRecent] = useState(false);

  useEffect(() => {
    if (!lastUpdated) {
      setDisplayTime("غير محدد");
      return;
    }

    const updateDisplay = () => {
      const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);

      // إذا كان التحديث خلال الدقيقتين الأخيرتين، يعتبر حديث
      setIsRecent(diffMinutes < 2);

      if (diffMinutes < 1) {
        setDisplayTime("الآن");
      } else {
        setDisplayTime(formatDistanceToNow(date, { addSuffix: true, locale: ar }));
      }
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 30000); // تحديث كل 30 ثانية

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}>
      {isRecent ? (
        <CheckCircle2 className="h-3 w-3 text-status-success" />
      ) : (
        <Clock className="h-3 w-3" />
      )}
      
      {showLabel && <span>آخر تحديث:</span>}
      
      <span className={cn(isRecent && "text-status-success font-medium")}>
        {displayTime}
      </span>

      {onRefresh && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 hover:bg-muted"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="تحديث البيانات"
        >
          <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
        </Button>
      )}
    </div>
  );
}
