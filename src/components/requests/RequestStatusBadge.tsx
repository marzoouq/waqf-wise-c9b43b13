import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";
type IconComponent = React.ComponentType<{ className?: string }>;

const variants: Record<string, { variant: BadgeVariant; icon: IconComponent }> = {
  'معلق': { variant: 'secondary', icon: Clock },
  'قيد المعالجة': { variant: 'default', icon: AlertCircle },
  'قيد المراجعة': { variant: 'default', icon: AlertCircle },
  'موافق': { variant: 'default', icon: CheckCircle },
  'مرفوض': { variant: 'destructive', icon: XCircle },
  'ملغي': { variant: 'secondary', icon: XCircle },
};

interface RequestStatusBadgeProps {
  status: string;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const config = variants[status] || variants['معلق'];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}
