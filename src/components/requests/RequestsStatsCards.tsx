import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { UnifiedKPICard } from '@/components/unified/UnifiedKPICard';
import { UnifiedStatsGrid } from '@/components/unified/UnifiedStatsGrid';

interface RequestsStats {
  total: number;
  pending: number;
  inProgress: number;
  approved: number;
  rejected: number;
  overdue: number;
}

interface RequestsStatsCardsProps {
  stats: RequestsStats;
  onFilterClick?: (status: string) => void;
  activeFilter?: string;
}

const statsConfig = [
  { key: 'total', label: 'إجمالي الطلبات', icon: FileText, variant: 'default' as const, filter: 'all' },
  { key: 'pending', label: 'قيد المراجعة', icon: Clock, variant: 'warning' as const, filter: 'قيد المراجعة' },
  { key: 'inProgress', label: 'قيد المعالجة', icon: Loader2, variant: 'primary' as const, filter: 'قيد المعالجة' },
  { key: 'approved', label: 'موافق عليه', icon: CheckCircle2, variant: 'success' as const, filter: 'موافق عليه' },
  { key: 'rejected', label: 'مرفوض', icon: XCircle, variant: 'destructive' as const, filter: 'مرفوض' },
  { key: 'overdue', label: 'متأخر', icon: AlertTriangle, variant: 'danger' as const, filter: 'overdue' },
];

export function RequestsStatsCards({ stats, onFilterClick, activeFilter }: RequestsStatsCardsProps) {
  return (
    <UnifiedStatsGrid columns={{ sm: 2, md: 3, lg: 6 }}>
      {statsConfig.map((config) => {
        const value = stats[config.key as keyof RequestsStats];
        const isActive = activeFilter === config.filter;
        
        return (
          <UnifiedKPICard
            key={config.key}
            title={config.label}
            value={value}
            icon={config.icon}
            variant={isActive ? 'primary' : config.variant}
            onClick={() => onFilterClick?.(config.filter)}
          />
        );
      })}
    </UnifiedStatsGrid>
  );
}
