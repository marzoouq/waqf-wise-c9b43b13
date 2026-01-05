/**
 * بطاقة طلب للعرض الشبكي
 * Request Grid Card Component
 */
import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { RequestStatusBadge } from './RequestStatusBadge';
import { PRIORITY_BADGE_STYLES } from '@/lib/request-constants';
import { getRequestTypeName, type FullRequest } from '@/types/request.types';

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
  const priorityStyle = PRIORITY_BADGE_STYLES[request.priority || ''] || { variant: 'secondary' as const };
  const beneficiaryName = request.beneficiary && 'full_name' in request.beneficiary 
    ? request.beneficiary.full_name 
    : '-';

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
                <Eye className="h-4 w-4 ml-2" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onApproval(request); }}>
                <GitBranch className="h-4 w-4 ml-2" />
                مسار الموافقات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onComments(request); }}>
                <MessageSquare className="h-4 w-4 ml-2" />
                التعليقات
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(request); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 ml-2" />
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
      </CardContent>
    </Card>
  );
});

RequestGridCard.displayName = 'RequestGridCard';
