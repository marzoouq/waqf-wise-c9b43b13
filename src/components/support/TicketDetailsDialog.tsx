import { useState } from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSupportTickets } from '@/hooks/support/useSupportTickets';

// Custom hook to get single ticket
function useSupportTicket(ticketId: string) {
  const { tickets, isLoading } = useSupportTickets({ search: ticketId });
  return {
    data: tickets?.find((t) => t.id === ticketId),
    isLoading,
  };
}
import { useTicketComments } from '@/hooks/support/useTicketComments';
import { Clock, User, MessageSquare, Send } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';

interface TicketDetailsDialogProps {
  ticketId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors = {
  open: 'bg-info',
  in_progress: 'bg-warning',
  waiting_customer: 'bg-secondary',
  resolved: 'bg-success',
  closed: 'bg-muted',
  cancelled: 'bg-destructive',
};

const statusLabels = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  waiting_customer: 'بانتظار العميل',
  resolved: 'تم الحل',
  closed: 'مغلقة',
  cancelled: 'ملغية',
};

export function TicketDetailsDialog({
  ticketId,
  open,
  onOpenChange,
}: TicketDetailsDialogProps) {
  const [newComment, setNewComment] = useState('');
  
  const { data: ticket, isLoading: ticketLoading } = useSupportTicket(ticketId || '');
  const { comments, addComment } = useTicketComments(ticketId || '');

  if (!ticketId) return null;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    await addComment.mutateAsync({ comment: newComment });
    setNewComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">
                {ticketLoading ? "جاري التحميل..." : ticket?.subject || "تفاصيل التذكرة"}
              </DialogTitle>
              {ticket && (
                <DialogDescription className="mt-1">
                  التذكرة #{ticket.ticket_number}
                </DialogDescription>
              )}
            </div>
            {ticket && (
              <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                {statusLabels[ticket.status as keyof typeof statusLabels]}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {ticketLoading ? (
          <LoadingState message="جاري تحميل التذكرة..." />
        ) : ticket ? (
          <div className="space-y-4">
            {/* معلومات التذكرة */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="text-sm font-medium">
                    {format(new Date(ticket.created_at), 'PPp', { locale: ar })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">المستخدم</p>
                  <p className="text-sm font-medium">
                    {ticket.beneficiary_id || 'غير محدد'}
                  </p>
                </div>
              </div>
            </div>

            {/* الوصف */}
            <div>
              <h3 className="font-semibold mb-2">الوصف</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>

            <Separator />

            {/* التعليقات */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                التعليقات ({comments?.length || 0})
              </h3>

              <ScrollArea className="h-[300px] pr-4">
                {comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="p-3 rounded-lg bg-muted/50 space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {comment.user_id || 'مستخدم'}
                          </span>
                          <span className="text-muted-foreground">
                            {format(new Date(comment.created_at), 'PPp', { locale: ar })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.comment}</p>
                        {comment.is_solution && (
                          <Badge variant="outline" className="text-success">
                            ✓ حل مقبول
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    لا توجد تعليقات بعد
                  </p>
                )}
              </ScrollArea>

              {/* إضافة تعليق */}
              {ticket.status !== 'closed' && ticket.status !== 'cancelled' && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="اكتب تعليقك هنا..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || addComment.isPending}
                    className="w-full"
                  >
                    <Send className="ms-2 h-4 w-4" />
                    إرسال التعليق
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            التذكرة غير موجودة
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
