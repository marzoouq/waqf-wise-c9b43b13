import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// ==================== Base Skeleton with Shimmer ====================

interface BaseSkeletonProps {
  className?: string;
}

/**
 * Skeleton أساسي مع تأثير Shimmer
 */
export function ShimmerSkeleton({ className }: BaseSkeletonProps) {
  return (
    <div 
      className={cn(
        'relative overflow-hidden bg-muted rounded-md',
        'before:absolute before:inset-0',
        'before:bg-gradient-to-r before:from-transparent before:via-background/50 before:to-transparent',
        'before:animate-[shimmer_1.5s_infinite]',
        className
      )}
    />
  );
}

// ==================== Card Skeleton ====================

interface CardSkeletonProps {
  lines?: number;
  showImage?: boolean;
  showHeader?: boolean;
  className?: string;
}

/**
 * Skeleton لبطاقة عامة
 */
export function CardSkeleton({ 
  lines = 3, 
  showImage = false,
  showHeader = true,
  className 
}: CardSkeletonProps) {
  return (
    <Card className={cn('p-4 space-y-4', className)}>
      {showImage && (
        <Skeleton className="h-40 w-full rounded-md" />
      )}
      
      {showHeader && (
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      )}
      
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={cn(
              'h-4',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )} 
          />
        ))}
      </div>
    </Card>
  );
}

// ==================== Table Row Skeleton ====================

interface TableRowSkeletonProps {
  columns?: number;
  rows?: number;
  className?: string;
}

/**
 * Skeleton لصفوف الجدول
 */
export function TableRowSkeleton({ 
  columns = 5, 
  rows = 5,
  className 
}: TableRowSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex gap-4 p-3 bg-muted/50 rounded-t-md">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="flex gap-4 p-3 border-b last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              className={cn(
                'h-4 flex-1',
                colIndex === 0 && 'w-12 flex-none'
              )} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ==================== KPI Skeleton ====================

interface KPISkeletonProps {
  variant?: 'default' | 'compact' | 'large';
  showIcon?: boolean;
  showTrend?: boolean;
  className?: string;
}

/**
 * Skeleton لبطاقات KPI
 */
export function KPISkeleton({ 
  variant = 'default',
  showIcon = true,
  showTrend = true,
  className 
}: KPISkeletonProps) {
  const sizes = {
    default: { card: 'p-4', title: 'h-4 w-24', value: 'h-8 w-32', trend: 'h-3 w-16' },
    compact: { card: 'p-3', title: 'h-3 w-20', value: 'h-6 w-24', trend: 'h-2 w-12' },
    large: { card: 'p-6', title: 'h-5 w-28', value: 'h-10 w-40', trend: 'h-4 w-20' },
  };
  
  const size = sizes[variant];
  
  return (
    <Card className={cn(size.card, 'space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className={size.title} />
        {showIcon && <Skeleton className="h-8 w-8 rounded-md" />}
      </div>
      
      <Skeleton className={size.value} />
      
      {showTrend && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className={size.trend} />
        </div>
      )}
    </Card>
  );
}

// ==================== Chart Skeleton ====================

interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'pie' | 'area';
  className?: string;
}

/**
 * Skeleton للرسوم البيانية
 */
export function ChartSkeleton({ 
  type = 'bar',
  className 
}: ChartSkeletonProps) {
  if (type === 'pie') {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
    );
  }
  
  return (
    <div className={cn('p-4 space-y-4', className)}>
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      
      {/* Chart area */}
      <div className="h-64 flex items-end gap-2 pt-4">
        {type === 'bar' && (
          <>
            {[60, 80, 45, 90, 70, 85, 55, 75].map((height, i) => (
              <Skeleton 
                key={i} 
                className="flex-1 rounded-t-md" 
                style={{ height: `${height}%` }}
              />
            ))}
          </>
        )}
        
        {(type === 'line' || type === 'area') && (
          <div className="w-full h-full relative">
            <Skeleton className="absolute inset-0 rounded-md" />
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-muted to-transparent rounded-b-md" />
          </div>
        )}
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

// ==================== List Skeleton ====================

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

/**
 * Skeleton للقوائم
 */
export function ListSkeleton({ 
  items = 5,
  showAvatar = true,
  showActions = false,
  className 
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div 
          key={i} 
          className="flex items-center gap-3 p-3 rounded-lg border"
        >
          {showAvatar && (
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          )}
          
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==================== Form Skeleton ====================

interface FormSkeletonProps {
  fields?: number;
  showButtons?: boolean;
  className?: string;
}

/**
 * Skeleton للنماذج
 */
export function FormSkeleton({ 
  fields = 4,
  showButtons = true,
  className 
}: FormSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
      
      {showButtons && (
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      )}
    </div>
  );
}

// ==================== Profile Skeleton ====================

interface ProfileSkeletonProps {
  showCover?: boolean;
  showStats?: boolean;
  className?: string;
}

/**
 * Skeleton للملف الشخصي
 */
export function ProfileSkeleton({ 
  showCover = true,
  showStats = true,
  className 
}: ProfileSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {showCover && (
        <Skeleton className="h-32 w-full rounded-lg" />
      )}
      
      <div className="flex items-start gap-4 px-4">
        <Skeleton className="h-20 w-20 rounded-full -mt-10 border-4 border-background flex-shrink-0" />
        
        <div className="flex-1 space-y-2 pt-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
      
      {showStats && (
        <div className="grid grid-cols-3 gap-4 px-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-6 w-12 mx-auto" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Dashboard Skeleton ====================

interface DashboardSkeletonProps {
  className?: string;
}

/**
 * Skeleton للوحة التحكم الكاملة
 */
export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <ChartSkeleton type="bar" />
        </Card>
        <Card className="p-4">
          <ChartSkeleton type="line" />
        </Card>
      </div>
      
      {/* Table */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
        <TableRowSkeleton columns={5} rows={5} />
      </Card>
    </div>
  );
}

// ==================== Mobile Card Skeleton ====================

interface MobileCardSkeletonProps {
  showBadge?: boolean;
  className?: string;
}

/**
 * Skeleton لبطاقة الجوال
 */
export function MobileCardSkeleton({ 
  showBadge = false,
  className 
}: MobileCardSkeletonProps) {
  return (
    <Card className={cn('p-3 space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        {showBadge && <Skeleton className="h-5 w-16 rounded-full" />}
      </div>
      
      <Skeleton className="h-6 w-32" />
      
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );
}

// ==================== Notification Skeleton ====================

export function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// ==================== Stats Grid Skeleton ====================

interface StatsGridSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsGridSkeleton({ count = 4, className }: StatsGridSkeletonProps) {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <KPISkeleton key={i} variant="compact" />
      ))}
    </div>
  );
}
