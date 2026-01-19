/**
 * بطاقة طلب للعرض الشبكي
 * Request Grid Card Component
 */
import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Eye, 
  GitBranch, 
  MessageSquare, 
  Trash2,
  Calendar,
  DollarSign,
  AlertTriangle,
  User,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { RequestStatusBadge } from './RequestStatusBadge';
import { PRIORITY_BADGE_STYLES, REQUEST_STATUS } from '@/lib/request-constants';
import { getRequestTypeName, type FullRequest } from '@/types/request.types';
import { RequestService } from '@/services/request.service';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface RequestGridCardProps {
  request: FullRequest;
  onViewDetails: (request: FullRequest) => void;
  onApproval: (request: FullRequest) => void;
  onComments: (request: FullRequest) => void;
  onDelete: (request: FullRequest) => void;
}

export const RequestGridCard = memo(({
  request,
  onViewDetails,
  onApproval,
  onComments,
  onDelete,
}: RequestGridCardProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const priorityStyle = PRIORITY_BADGE_STYLES[request.priority || ''] || { variant: 'secondary' as const };
  const beneficiaryName = request.beneficiary && 'full_name' in request.beneficiary 
    ? request.beneficiary.full_name 
    : '-';

  // التحقق من كون الطلب قيد المراجعة
  const isPending = [
    REQUEST_STATUS.PENDING,
    REQUEST_STATUS.IN_PROGRESS,
    'معلق',
    'قيد المراجعة',
    'قيد المعالجة'
  ].includes(request.status || '');

  const handleQuickApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await RequestService.updateRequestStatus(request.id, 'موافق عليه', 'تمت الموافقة');
      toast.success('تمت الموافقة على الطلب');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    } catch {
      toast.error('فشل في الموافقة على الطلب');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProcessing(true);
    try {
      await RequestService.updateRequestStatus(request.id, 'مرفوض', 'تم الرفض');
      toast.success('تم رفض الطلب');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    } catch {
      toast.error('فشل في رفض الطلب');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card 
      className={`hover:shadow-md transition-all cursor-pointer group relative ${
        request.is_overdue ? 'border-destructive/50 bg-destructive/5' : ''
      }`}
      onClick={() => onViewDetails(request)}
    >
      {/* مؤشر الطلب المتأخر */}
      {request.is_overdue && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-destructive rounded-tr-lg" />
      )}

      <CardContent className="p-4">
        {/* Header: رقم الطلب + القائمة */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-mono text-sm font-semibold text-primary">
              {request.request_number}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {getRequestTypeName(request)}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewDetails(request); }}>
                <Eye className="h-4 w-4 ms-2" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onApproval(request); }}>
                <GitBranch className="h-4 w-4 ms-2" />
                مسار الموافقات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onComments(request); }}>
                <MessageSquare className="h-4 w-4 ms-2" />
                التعليقات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(request); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 ms-2" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* المستفيد */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">{beneficiaryName}</span>
        </div>

        {/* الوصف */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
          {request.description}
        </p>

        {/* المبلغ */}
        {request.amount && request.amount > 0 && (
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-emerald-600">
              {request.amount.toLocaleString('ar-SA')} ريال
            </span>
          </div>
        )}

        {/* الحالة والأولوية */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <RequestStatusBadge status={request.status} />
          <Badge variant={priorityStyle.variant} className="text-xs">
            {request.priority}
          </Badge>
          {request.is_overdue && (
            <Badge variant="destructive" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              متأخر
            </Badge>
          )}
        </div>

        {/* التاريخ */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {request.submitted_at 
              ? format(new Date(request.submitted_at), 'dd MMM yyyy', { locale: ar })
              : '-'}
          </span>
        </div>

        {/* أزرار الموافقة/الرفض السريعة للطلبات المعلقة */}
        {isPending && (
          <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8 text-success border-success/30 hover:bg-success/10 hover:text-success"
              onClick={handleQuickApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 ms-1" />
                  موافقة
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleQuickReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-3 w-3 ms-1" />
                  رفض
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

RequestGridCard.displayName = 'RequestGridCard';

