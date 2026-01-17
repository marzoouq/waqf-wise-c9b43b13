import { useState } from 'react';
import { matchesStatus } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageErrorBoundary } from '@/components/shared/PageErrorBoundary';
import { MobileOptimizedLayout, MobileOptimizedHeader } from '@/components/layout/MobileOptimizedLayout';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Ticket, 
  Plus,
  Clock,
  MessageSquare,
  Star
} from 'lucide-react';
import { useSupportTickets } from '@/hooks/support/useSupportTickets';
import { CreateTicketDialog } from '@/components/support/CreateTicketDialog';
import { TicketDetailsDialog } from '@/components/support/TicketDetailsDialog';
import { TicketRatingDialog } from '@/components/support/TicketRatingDialog';
import { LoadingState } from '@/components/shared/LoadingState';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { SupportFilters } from '@/types/support';
import { cleanFilters } from '@/lib/utils/cleanFilters';

const statusLabels = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'ملغية',
};

const statusColors = {
  open: 'default',
  in_progress: 'secondary',
  waiting_customer: 'outline',
  resolved: 'default',
  closed: 'secondary',
  cancelled: 'destructive',
} as const;

export default function Support() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ratingTicketId, setRatingTicketId] = useState<string | null>(null);
  const [filters, setFilters] = useState<SupportFilters>({});

  const { tickets, isLoading: ticketsLoading } = useSupportTickets(cleanFilters(filters));

  return (
    <PageErrorBoundary pageName="الدعم الفني">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الدعم الفني"
          description="تذاكر الدعم الفني الخاصة بك"
          icon={<Ticket className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
          actions={
            <Button onClick={() => setCreateDialogOpen(true)} size="sm">
              <Plus className="h-4 w-4 ms-2" />
              <span className="hidden sm:inline">تذكرة جديدة</span>
              <span className="sm:hidden">جديد</span>
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>تذاكر الدعم الخاصة بي</CardTitle>
            <CardDescription>
              متابعة حالة جميع تذاكر الدعم الفني
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="البحث في التذاكر..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="flex-1"
                />
              </div>

              {ticketsLoading ? (
                <LoadingState message="جاري تحميل التذاكر..." />
              ) : tickets && tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTicketId(ticket.id)}
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ticket.subject}</p>
                          <Badge variant="outline" className="text-xs">
                            #{ticket.ticket_number}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {ticket.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(ticket.created_at), 'PP', { locale: ar })}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.response_count} رد
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={statusColors[ticket.status as keyof typeof statusColors]}>
                          {statusLabels[ticket.status as keyof typeof statusLabels]}
                        </Badge>
                        {matchesStatus(ticket.status, 'resolved') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRatingTicketId(ticket.id);
                            }}
                          >
                            <Star className="h-3 w-3 ms-1" />
                            تقييم
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد تذاكر</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 ms-2" />
                    إنشاء تذكرة جديدة
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <CreateTicketDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />

        <TicketDetailsDialog
          ticketId={selectedTicketId}
          open={!!selectedTicketId}
          onOpenChange={(open) => !open && setSelectedTicketId(null)}
        />

        <TicketRatingDialog
          ticketId={ratingTicketId}
          open={!!ratingTicketId}
          onOpenChange={(open) => !open && setRatingTicketId(null)}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
