import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';

interface TicketCardProps {
  id: string;
  subject: string;
  ticketNumber?: string;
  beneficiaryName?: string;
  userEmail?: string;
  status: string;
  createdAt: string;
  isOverdue?: boolean;
  showTicketNumber?: boolean;
  onClick?: (id: string) => void;
  className?: string;
}

const statusLabels: Record<string, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'ملغية',
};

export function TicketCard({
  id,
  subject,
  ticketNumber,
  beneficiaryName,
  userEmail,
  status,
  createdAt,
  isOverdue = false,
  showTicketNumber = false,
  onClick,
  className,
}: TicketCardProps) {
  const displayName = beneficiaryName || userEmail;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors",
        isOverdue && "border border-destructive/50",
        className
      )}
      onClick={() => onClick?.(id)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{subject}</p>
          {showTicketNumber && ticketNumber && (
            <Badge variant="outline" className="shrink-0">#{ticketNumber}</Badge>
          )}
        </div>
        {displayName && (
          <p className="text-sm text-muted-foreground truncate">
            {displayName}
          </p>
        )}
        {!showTicketNumber && ticketNumber && (
          <p className="text-sm text-muted-foreground">
            #{ticketNumber}
          </p>
        )}
      </div>
      <div className="text-left space-y-1 sm:space-y-2 shrink-0 me-2">
        {isOverdue ? (
          <Badge variant="destructive">متأخر</Badge>
        ) : (
          <Badge>{statusLabels[status] || status}</Badge>
        )}
        <p className="text-xs text-muted-foreground">
          {formatDate(createdAt, 'PP')}
        </p>
      </div>
    </div>
  );
}
