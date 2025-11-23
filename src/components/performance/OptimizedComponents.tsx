/**
 * مكونات محسّنة باستخدام React.memo و useMemo
 * تحسين أداء المكونات الكبيرة والمتكررة
 */

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

// ==================== StatsCard المحسّن ====================
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass?: string;
  subtext?: string;
}

export const OptimizedStatsCard = memo(function OptimizedStatsCard({
  title,
  value,
  icon: Icon,
  colorClass = 'text-primary',
  subtext,
}: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && (
          <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
        )}
      </CardContent>
    </Card>
  );
});

// ==================== DataCard المحسّن ====================
interface DataCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const OptimizedDataCard = memo(function OptimizedDataCard({
  title,
  children,
  className = '',
}: DataCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
});

// ==================== ListItem المحسّن ====================
interface ListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export const OptimizedListItem = memo(function OptimizedListItem({
  title,
  subtitle,
  icon: Icon,
  actions,
  onClick,
}: ListItemProps) {
  return (
    <div
      className="flex items-center justify-between p-4 border-b hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        <div>
          <h4 className="font-medium">{title}</h4>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
});

// ==================== StatusBadge المحسّن ====================
interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const statusColors = {
  default: 'bg-secondary text-secondary-foreground',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  destructive: 'bg-destructive-light text-destructive',
};

export const OptimizedStatusBadge = memo(function OptimizedStatusBadge({
  status,
  variant = 'default',
}: StatusBadgeProps) {
  const colorClass = useMemo(() => statusColors[variant], [variant]);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {status}
    </span>
  );
});

// ==================== EmptyState المحسّن ====================
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const OptimizedEmptyState = memo(function OptimizedEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action}
    </div>
  );
});
