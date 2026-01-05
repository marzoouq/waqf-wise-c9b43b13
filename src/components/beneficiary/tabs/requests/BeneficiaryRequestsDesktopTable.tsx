/**
 * جدول الطلبات للشاشات الكبيرة
 * @version 1.0.0
 */

import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Eye,
  LucideIcon
} from "lucide-react";
import { format, arLocale as ar } from "@/lib/date";
import { SLAIndicator } from "../../SLAIndicator";
import { RequestAttachmentsUploader } from "../../RequestAttachmentsUploader";

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

interface BeneficiaryRequestsDesktopTableProps {
  requests: BeneficiaryRequest[];
  isLoading: boolean;
  onViewDetails: (requestId: string) => void;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

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
    "عاجلة": { variant: "destructive" },
    "عاجل": { variant: "destructive" },
    "عالية": { variant: "default" },
    "مهمة": { variant: "default" },
    "متوسطة": { variant: "secondary" },
    "منخفضة": { variant: "secondary" },
  };

  const s = config[priority] || { variant: "secondary" };
  return <Badge variant={s.variant}>{priority}</Badge>;
};

export const BeneficiaryRequestsDesktopTable = memo(function BeneficiaryRequestsDesktopTable({
  requests,
  isLoading,
  onViewDetails,
}: BeneficiaryRequestsDesktopTableProps) {
  return (
    <div className="rounded-md border hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم الطلب</TableHead>
            <TableHead className="text-right">النوع</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">الأولوية</TableHead>
            <TableHead className="text-right">SLA</TableHead>
            <TableHead className="text-right">المرفقات</TableHead>
            <TableHead className="text-right">تاريخ التقديم</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  جاري التحميل...
                </div>
              </TableCell>
            </TableRow>
          ) : requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-12">
                <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>لا توجد طلبات تطابق معايير البحث</p>
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow 
                key={request.id}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => onViewDetails(request.id)}
              >
                <TableCell className="font-medium font-mono">
                  #{request.request_number || "—"}
                </TableCell>
                <TableCell>
                  {request.request_types?.name_ar || "—"}
                </TableCell>
                <TableCell>
                  {request.amount 
                    ? `${Number(request.amount).toLocaleString("ar-SA")} ريال`
                    : "—"}
                </TableCell>
                <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                <TableCell>
                  <SLAIndicator
                    slaDueAt={request.sla_due_at}
                    status={request.status || "معلق"}
                    showLabel={true}
                  />
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <RequestAttachmentsUploader
                    requestId={request.id}
                    attachmentsCount={request.attachments_count || 0}
                  />
                </TableCell>
                <TableCell>
                  {request.created_at && format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
                </TableCell>
                <TableCell>{getStatusBadge(request.status || "معلق")}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(request.id)}
                  >
                    <Eye className="h-4 w-4 ms-1" />
                    عرض
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});
