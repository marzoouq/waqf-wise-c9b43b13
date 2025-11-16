import { useState } from 'react';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TicketDetailsDialog } from './TicketDetailsDialog';
import type { TicketStatus, TicketPriority } from '@/types/support';

const statusLabels: Record<TicketStatus, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'في انتظار العميل',
  resolved: 'محلولة',
  closed: 'مغلقة',
  cancelled: 'ملغاة',
};

const priorityLabels: Record<TicketPriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

const statusIcons: Record<TicketStatus, any> = {
  open: Clock,
  in_progress: Clock,
  waiting_customer: Clock,
  resolved: CheckCircle2,
  closed: XCircle,
  cancelled: XCircle,
};

export function MyTicketsList() {
  const [search, setSearch] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  const { tickets, isLoading } = useSupportTickets({ search });

  if (isLoading) {
    return <div className="text-center py-12">جاري التحميل...</div>;
  }

  if (!tickets?.length) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <div className="text-4xl">📋</div>
          <h3 className="text-xl font-semibold">لا توجد تذاكر بعد</h3>
          <p className="text-muted-foreground">
            لم تقم بإنشاء أي تذكرة دعم حتى الآن. انقر على "تذكرة جديدة" للبدء.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في التذاكر..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => {
          const StatusIcon = statusIcons[ticket.status];
          
          return (
            <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {ticket.ticket_number}
                    </Badge>
                    <Badge
                      variant={
                        ticket.status === 'resolved' || ticket.status === 'closed'
                          ? 'default'
                          : ticket.status === 'in_progress'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      <StatusIcon className="ml-1 h-3 w-3" />
                      {statusLabels[ticket.status]}
                    </Badge>
                    <Badge
                      variant={
                        ticket.priority === 'urgent'
                          ? 'destructive'
                          : ticket.priority === 'high'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {priorityLabels[ticket.priority]}
                    </Badge>
                    {ticket.is_overdue && (
                      <Badge variant="destructive">متأخر</Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ticket.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      تاريخ الإنشاء:{' '}
                      {format(new Date(ticket.created_at), 'PPp', { locale: ar })}
                    </span>
                    {ticket.response_count > 0 && (
                      <span>الردود: {ticket.response_count}</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTicketId(ticket.id)}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedTicketId && (
        <TicketDetailsDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
        />
      )}
    </div>
  );
}
