/**
 * TimeZoneCard Component
 * Displays time for a single timezone with day/night indicator
 */

import { Sun, Moon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  format24Hour,
  format12Hour,
  formatDate,
  getTimezoneOffset,
  isDaytime,
  type TimeZoneInfo,
} from '@/lib/timeUtils';
import { cn } from '@/lib/utils';

interface TimeZoneCardProps {
  timezone: TimeZoneInfo;
  currentTime: Date;
  is24Hour: boolean;
  onRemove?: (timezoneId: string) => void;
  isRemovable?: boolean;
}

export function TimeZoneCard({
  timezone,
  currentTime,
  is24Hour,
  onRemove,
  isRemovable = true,
}: TimeZoneCardProps) {
  const timeString = is24Hour
    ? format24Hour(currentTime, timezone.offset)
    : format12Hour(currentTime, timezone.offset);
  
  const dateString = formatDate(currentTime, timezone.offset, false);
  const offset = getTimezoneOffset(timezone.offset);
  const isDay = isDaytime(currentTime, timezone.offset);

  return (
    <Card className={cn(
      'relative transition-all duration-300 hover:shadow-lg',
      isDay ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20' : 'bg-gradient-to-br from-indigo-950/30 to-purple-950/30'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {isDay ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-4 w-4 text-blue-300" />
              )}
              <span className="truncate">{timezone.name}</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 font-arabic">
              {timezone.nameAr}
            </p>
          </div>
          {isRemovable && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => onRemove(timezone.id)}
              aria-label={`Remove ${timezone.name}`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-4xl font-mono font-bold tracking-tight tabular-nums">
          {timeString}
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-medium">{dateString}</p>
          <p className="text-xs">UTC {offset}</p>
        </div>
      </CardContent>
    </Card>
  );
}
