/**
 * بطاقة طلب المستفيد للجوال
 * @version 1.0.0
 */

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Eye,
  FileText,
  Paperclip,
  AlertTriangle,
  LucideIcon
} from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { cn } from "@/lib/utils";
import { SLAIndicator } from "../../SLAIndicator";

interface RequestType {
  name_ar: string;
  requires_amount?: boolean;
}

interface BeneficiaryRequest {
  id: string;
  request_number: string | null;
  description: string;
  status: string | null;
  priority: string | null;
  amount: number | null;
  created_at: string | null;
  sla_due_at: string | null;
  attachments_count: number | null;
  is_overdue: boolean | null;
  request_types: RequestType | null;
}

interface BeneficiaryRequestMobileCardProps {
  request: BeneficiaryRequest;
  onViewDetails: (requestId: string) => void;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const getStatusConfig = (status: string): { icon: LucideIcon; variant: BadgeVariant; colorClass: string } => {
  const configs: Record<string, { icon: LucideIcon; variant: BadgeVariant; colorClass: string }> = {
    "معلق": { icon: Clock, variant: "secondary", colorClass: "" },
    "قيد المراجعة": { icon: FileText, variant: "default", colorClass: "" },
    "معتمد": { icon: CheckCircle2, variant: "outline", colorClass: "text-success border-success/30 bg-success/10" },
    "مرفوض": { icon: XCircle, variant: "destructive", colorClass: "" },
  };
  return configs[status] || { icon: AlertCircle, variant: "secondary", colorClass: "" };
};

const getPriorityConfig = (priority: string | null): { label: string; colorClass: string } | null => {
  if (!priority) return null;
  
  const configs: Record<string, { label: string; colorClass: string }> = {
    "عاجلة": { label: "عاجلة", colorClass: "text-destructive border-destructive/30 bg-destructive/10" },
    "عاجل": { label: "عاجل", colorClass: "text-destructive border-destructive/30 bg-destructive/10" },
    "عالية": { label: "عالية", colorClass: "text-warning border-warning/30 bg-warning/10" },
    "مهمة": { label: "مهمة", colorClass: "text-warning border-warning/30 bg-warning/10" },
    "متوسطة": { label: "متوسطة", colorClass: "text-muted-foreground" },
    "منخفضة": { label: "منخفضة", colorClass: "text-muted-foreground" },
  };
  return configs[priority] || null;
};

export const BeneficiaryRequestMobileCard = memo(function BeneficiaryRequestMobileCard({
  request,
  onViewDetails,
}: BeneficiaryRequestMobileCardProps) {
  const statusConfig = getStatusConfig(request.status || "معلق");
  const StatusIcon = statusConfig.icon;
  const priorityConfig = getPriorityConfig(request.priority);

  return (
    <Card 
      className="shadow-soft cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99]"
      onClick={() => onViewDetails(request.id)}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant="outline" className="text-xs font-mono">
                #{request.request_number || "—"}
              </Badge>
              {request.is_overdue && (
                <Badge variant="destructive" className="text-xs gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  متأخر
                </Badge>
              )}
            </div>
            <p className="font-medium text-sm line-clamp-1">
              {request.request_types?.name_ar || "طلب"}
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(request.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {request.description}
        </p>

        {/* Status & Priority Row */}
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge 
            variant={statusConfig.variant} 
            className={cn("gap-1 text-xs", statusConfig.colorClass)}
          >
            <StatusIcon className="h-3 w-3" />
            {request.status || "معلق"}
          </Badge>
          
          {priorityConfig && (
            <Badge variant="outline" className={cn("text-xs", priorityConfig.colorClass)}>
              {priorityConfig.label}
            </Badge>
          )}
          
          {(request.attachments_count || 0) > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <Paperclip className="h-3 w-3" />
              {request.attachments_count}
            </Badge>
          )}
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <SLAIndicator
              slaDueAt={request.sla_due_at}
              status={request.status || "معلق"}
              showLabel={false}
            />
            {request.created_at && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
              </span>
            )}
          </div>
          
          {request.amount && request.amount > 0 && (
            <span className="text-sm font-bold text-primary">
              {Number(request.amount).toLocaleString("ar-SA")} ر.س
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
