import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  { key: 'total', label: 'إجمالي الطلبات', icon: FileText, colorClass: 'text-foreground', filter: 'all' },
  { key: 'pending', label: 'قيد المراجعة', icon: Clock, colorClass: 'text-warning', filter: 'قيد المراجعة' },
  { key: 'inProgress', label: 'قيد المعالجة', icon: Loader2, colorClass: 'text-primary', filter: 'قيد المعالجة' },
  { key: 'approved', label: 'موافق عليه', icon: CheckCircle2, colorClass: 'text-success', filter: 'موافق عليه' },
  { key: 'rejected', label: 'مرفوض', icon: XCircle, colorClass: 'text-destructive', filter: 'مرفوض' },
  { key: 'overdue', label: 'متأخر', icon: AlertTriangle, colorClass: 'text-destructive', filter: 'overdue' },
];

export function RequestsStatsCards({ stats, onFilterClick, activeFilter }: RequestsStatsCardsProps) {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
      {statsConfig.map((config, index) => {
        const Icon = config.icon;
        const value = stats[config.key as keyof RequestsStats];
        const isActive = activeFilter === config.filter;
        
        return (
          <Card 
            key={config.key}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              isActive && "ring-2 ring-primary",
              index >= 3 && "hidden sm:block",
              index >= 4 && "hidden md:block"
            )}
            onClick={() => onFilterClick?.(config.filter)}
          >
            <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.colorClass)} />
                {config.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className={cn("text-lg sm:text-xl md:text-2xl font-bold", config.colorClass)}>
                {value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
