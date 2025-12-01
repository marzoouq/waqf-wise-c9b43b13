import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, DollarSign, Calendar, Eye, Clock, CheckCircle2, XCircle, AlertCircle, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { SLAIndicator } from "./SLAIndicator";
import { RequestAttachmentsUploader } from "./RequestAttachmentsUploader";

interface MobileRequestCardProps {
  request: {
    id: string;
    request_number: string | null;
    amount: number | null;
    priority: string | null;
    sla_due_at: string | null;
    attachments_count: number | null;
    created_at: string | null;
    status: string | null;
    request_types?: {
      name_ar: string;
    } | null;
  };
  onView: (id: string) => void;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function MobileRequestCard({ request, onView }: MobileRequestCardProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: LucideIcon; variant: BadgeVariant }> = {
      "معلق": { icon: Clock, variant: "secondary" },
      "قيد المراجعة": { icon: FileText, variant: "default" },
      "معتمد": { icon: CheckCircle2, variant: "outline" },
      "مرفوض": { icon: XCircle, variant: "destructive" },
    };

    const s = config[status] || { icon: AlertCircle, variant: "secondary" };
    const Icon = s.icon;

    return (
      <Badge variant={s.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null;
    
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      "عاجل": { variant: "destructive" },
      "مهم": { variant: "default" },
      "عادي": { variant: "secondary" },
    };

    const s = config[priority] || { variant: "secondary" };
    return <Badge variant={s.variant} className="text-xs">{priority}</Badge>;
  };

  return (
    <Card className="hover-scale">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="h-5 w-5 text-primary shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">{request.request_number || "—"}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {request.request_types?.name_ar || "—"}
              </p>
            </div>
          </div>
          {getStatusBadge(request.status || "معلق")}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {request.amount && (
            <>
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>المبلغ:</span>
              </div>
              <div className="text-left font-semibold">
                {Number(request.amount).toLocaleString("ar-SA")} ر.س
              </div>
            </>
          )}

          {request.priority && (
            <>
              <div className="text-muted-foreground">الأولوية:</div>
              <div className="text-left">{getPriorityBadge(request.priority)}</div>
            </>
          )}

          {request.created_at && (
            <>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>التاريخ:</span>
              </div>
              <div className="text-left">
                {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <SLAIndicator
              slaDueAt={request.sla_due_at}
              status={request.status || "معلق"}
              showLabel={false}
            />
            <RequestAttachmentsUploader
              requestId={request.id}
              attachmentsCount={request.attachments_count || 0}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(request.id)}
            className="h-8 text-xs"
          >
            <Eye className="h-3 w-3 ml-1" />
            عرض
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
