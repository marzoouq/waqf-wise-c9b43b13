/**
 * Network Status Indicator
 * مؤشر حالة الشبكة المصغر
 */

import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useConnectionMonitor } from '@/hooks/system/useConnectionMonitor';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NetworkStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export function NetworkStatusIndicator({ className, showLabel = false }: NetworkStatusIndicatorProps) {
  const { stats, isOnline } = useConnectionMonitor();

  const getIcon = () => {
    if (!isOnline) {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
    if (stats.currentStatus === 'degraded') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Wifi className="h-4 w-4 text-green-500" />;
  };

  const getLabel = () => {
    if (!isOnline) return 'غير متصل';
    if (stats.currentStatus === 'degraded') return 'اتصال بطيء';
    return 'متصل';
  };

  const getTooltip = () => {
    const parts = [getLabel()];
    if (stats.totalDisconnections > 0) {
      parts.push(`${stats.totalDisconnections} انقطاع`);
    }
    return parts.join(' • ');
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              'flex items-center gap-1.5 cursor-help',
              className
            )}
          >
            {getIcon()}
            {showLabel && (
              <span className="text-xs text-muted-foreground">
                {getLabel()}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltip()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default NetworkStatusIndicator;
