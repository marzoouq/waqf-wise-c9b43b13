/**
 * Types for UI Components
 * أنواع مكونات الواجهة
 */

import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

// Icon types
export type IconComponent = LucideIcon | ComponentType<{ className?: string }>;

// Badge variant types
export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Status badge configurations
export interface StatusBadgeConfig {
  variant: BadgeVariant;
  label: string;
}

// Timeline metadata
export interface TimelineMetadata {
  [key: string]: string | number | boolean | null | undefined;
}

// Table column render function
export type ColumnRenderFn<T, V = unknown> = (value: V, row: T) => React.ReactNode;
