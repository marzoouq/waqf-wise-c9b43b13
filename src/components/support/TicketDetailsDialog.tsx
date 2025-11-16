import { useState } from 'react';
import { useSupportTicket } from '@/hooks/useSupportTickets';
import { useTicketComments } from '@/hooks/useTicketComments';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock, User, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
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

interface TicketDetailsDialogProps {
  ticketId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TicketDetailsDialog({
  ticketId,
  open,
  onOpenChange,
}: TicketDetailsDialogProps) {
  const { data: ticket } = useSupportTicket(ticketId);
  const { comments, addComment } = useTicketComments(ticketId);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addComment.mutateAsync({ comment: newComment });
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>تذكرة #{ticket.ticket_number}</span>
            <Badge variant="outline">{statusLabels[ticket.status]}</Badge>
            <Badge variant={ticket.priority === 'urgent' ? 'destructive' : 'secondary'}>
              {priorityLabels[ticket.priority]}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Details */}
          <Card className="p-4">
            <h3 className="font-semibold text-lg mb-2">{ticket.subject}</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {ticket.description}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(ticket.created_at), 'PPp', { locale: ar })}
              </div>
              {ticket.first_response_at && (
                <div>أول رد: {format(new Date(ticket.first_response_at), 'PPp', { locale: ar })}</div>
              )}
            </div>
          </Card>

          <Separator />

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="font-semibold">الردود والتعليقات</h3>
            
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Card key={comment.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {comment.is_internal ? 'فريق الدعم' : 'أنت'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(comment.created_at), 'PPp', { locale: ar })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {comment.comment}
                        </p>
                        {comment.is_solution && (
                          <Badge variant="default" className="mt-2">
                            حل المشكلة
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد ردود بعد
              </div>
            )}

            {/* Add Comment */}
            {ticket.status !== 'closed' && ticket.status !== 'cancelled' && (
              <div className="space-y-3">
                <Textarea
                  placeholder="اكتب ردك هنا..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={isSubmitting || !newComment.trim()}
                  >
                    <Send className="ml-2 h-4 w-4" />
                    {isSubmitting ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
