import { cn } from '@/lib/utils';

interface DistributionBarProps {
  label: string;
  count: number;
  maxCount: number;
  color?: 'primary' | 'destructive' | 'warning' | 'success';
  className?: string;
}

const colorMap = {
  primary: 'bg-primary',
  destructive: 'bg-destructive',
  warning: 'bg-warning',
  success: 'bg-success',
};

export function DistributionBar({
  label,
  count,
  maxCount,
  color = 'primary',
  className,
}: DistributionBarProps) {
  const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-24 sm:w-32 bg-muted rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all", colorMap[color])}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-8 text-left">
          {count}
        </span>
      </div>
    </div>
  );
}

interface DistributionListProps {
  data: Record<string, number>;
  getColor?: (key: string) => 'primary' | 'destructive' | 'warning' | 'success';
  emptyMessage?: string;
}

export function DistributionList({
  data,
  getColor,
  emptyMessage = 'لا توجد بيانات',
}: DistributionListProps) {
  const entries = Object.entries(data);
  
  if (entries.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {emptyMessage}
      </p>
    );
  }

  const maxCount = Math.max(...entries.map(([, v]) => Number(v)));

  return (
    <div className="space-y-3">
      {entries.map(([key, count]) => (
        <DistributionBar
          key={key}
          label={key}
          count={Number(count)}
          maxCount={maxCount}
          color={getColor?.(key) || 'primary'}
        />
      ))}
    </div>
  );
}
