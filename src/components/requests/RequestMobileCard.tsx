import { memo } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, MoreVertical, Eye, MessageSquare, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, arLocale as ar } from "@/lib/date";
import { getRequestTypeName, getBeneficiaryName, type FullRequest } from "@/types/request.types";
import { REQUEST_STATUS, REQUEST_PRIORITY } from '@/lib/request-constants';

interface RequestMobileCardProps {
  request: FullRequest;
  onViewDetails: (request: FullRequest) => void;
  onViewComments: (request: FullRequest) => void;
  onDelete: (request: FullRequest) => void;
}

const getStatusConfig = (status: string | null | undefined) => {
  switch (status) {
    case REQUEST_STATUS.PENDING:
    case 'قيد المراجعة':
      return { variant: 'secondary' as const, icon: Clock, className: 'bg-warning/10 text-warning border-warning/30' };
    case REQUEST_STATUS.IN_PROGRESS:
    case 'قيد المعالجة':
      return { variant: 'default' as const, icon: AlertCircle, className: 'bg-primary/10 text-primary border-primary/30' };
    case REQUEST_STATUS.APPROVED:
    case REQUEST_STATUS.COMPLETED:
    case 'موافق':
      return { variant: 'default' as const, icon: CheckCircle, className: 'bg-success/10 text-success border-success/30' };
    case REQUEST_STATUS.REJECTED:
    case 'مرفوض':
      return { variant: 'destructive' as const, icon: XCircle, className: '' };
    case 'ملغي':
      return { variant: 'secondary' as const, icon: XCircle, className: '' };
    default:
      return { variant: 'secondary' as const, icon: Clock, className: '' };
  }
};

const getPriorityBadge = (priority: string | null | undefined) => {
  switch (priority) {
    case REQUEST_PRIORITY.URGENT:
    case 'عاجل':
      return 'bg-destructive/10 text-destructive border-destructive/30';
    case REQUEST_PRIORITY.HIGH:
    case 'عالية':
    case 'مهم':
      return 'bg-warning/10 text-warning border-warning/30';
    case REQUEST_PRIORITY.MEDIUM:
    case 'متوسطة':
      return 'bg-primary/10 text-primary border-primary/30';
    case REQUEST_PRIORITY.LOW:
    case 'منخفضة':
    case 'عادي':
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const RequestMobileCard = memo(function RequestMobileCard({
  request,
  onViewDetails,
  onViewComments,
  onDelete,
}: RequestMobileCardProps) {
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="shadow-soft">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs shrink-0">
                {request.request_number}
              </Badge>
              {request.is_overdue && (
                <Badge variant="destructive" className="text-xs">
                  متأخر
                </Badge>
              )}
            </div>
            
            <p className="font-medium text-sm truncate">
              {getBeneficiaryName(request)}
            </p>
            
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {getRequestTypeName(request)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onViewDetails(request)}>
                <Eye className="ms-2 h-4 w-4" />
                عرض التفاصيل
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewComments(request)}>
                <MessageSquare className="ms-2 h-4 w-4" />
                التعليقات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => onDelete(request)}
              >
                <Trash2 className="ms-2 h-4 w-4" />
                حذف
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Badge 
              variant={statusConfig.variant} 
              className={`gap-1 text-xs ${statusConfig.className}`}
            >
              <StatusIcon className="h-3 w-3" />
              {request.status}
            </Badge>
            <Badge variant="outline" className={`text-xs ${getPriorityBadge(request.priority)}`}>
              {request.priority}
            </Badge>
          </div>
          
          {request.amount && request.amount > 0 && (
            <span className="text-xs font-semibold text-primary">
              {request.amount.toLocaleString('ar-SA')} ر.س
            </span>
          )}
        </div>

        {request.submitted_at && (
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(request.submitted_at), 'yyyy/MM/dd', { locale: ar })}
          </p>
        )}
      </CardContent>
    </Card>
  );
});
