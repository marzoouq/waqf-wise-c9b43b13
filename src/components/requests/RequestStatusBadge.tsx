import { Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { REQUEST_STATUS } from '@/lib/request-constants';

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type IconComponent = React.ComponentType<{ className?: string }>;

interface StatusConfig {
  variant: BadgeVariant;
  icon: IconComponent;
  className?: string;
}

const getVariant = (status: string | null | undefined): StatusConfig => {
  switch (status) {
    case REQUEST_STATUS.PENDING:
    case 'قيد المراجعة':
      return { variant: 'secondary', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' };
    case REQUEST_STATUS.IN_PROGRESS:
    case 'قيد المعالجة':
      return { variant: 'default', icon: Loader2, className: 'bg-primary/10 text-primary border-primary/30' };
    case REQUEST_STATUS.APPROVED:
    case REQUEST_STATUS.COMPLETED:
    case 'موافق':
    case 'مكتمل':
      return { variant: 'default', icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' };
    case REQUEST_STATUS.REJECTED:
    case 'مرفوض':
    case 'ملغي':
      return { variant: 'destructive', icon: XCircle };
    case 'معلق':
      return { variant: 'secondary', icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' };
    default:
      return { variant: 'secondary', icon: Clock };
  }
};

interface RequestStatusBadgeProps {
  status: string | null | undefined;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const config = getVariant(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className || ''}`}>
      <Icon className="h-3 w-3" />
      {status || '-'}
    </Badge>
  );
}
