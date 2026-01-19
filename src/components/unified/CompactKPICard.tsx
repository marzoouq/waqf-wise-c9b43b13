import { type LucideIcon } from "lucide-react";
import { UnifiedKPICard } from "./UnifiedKPICard";

interface CompactKPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral' | string;
  trendValue?: string;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'destructive' | 'default' | 'danger';
  loading?: boolean;
  onClick?: () => void;
}

/**
 * CompactKPICard - بطاقة KPI مدمجة للجوال
 * 
 * Wrapper حول UnifiedKPICard مع size="compact"
 * للاستخدام في الشاشات الصغيرة أو عند الحاجة لبطاقات أصغر
 * 
 * ⚠️ API مغلق: لا يقبل className أو style أو children
 */
export function CompactKPICard(props: CompactKPICardProps) {
  return <UnifiedKPICard {...props} size="compact" />;
}
