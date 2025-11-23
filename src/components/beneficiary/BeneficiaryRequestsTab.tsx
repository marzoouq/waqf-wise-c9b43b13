import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RequestSubmissionDialog } from "./RequestSubmissionDialog";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Paperclip,
} from "lucide-react";

interface BeneficiaryRequestsTabProps {
  beneficiaryId: string;
}

interface Request {
  id: string;
  request_number: string | null;
  description: string;
  amount: number | null;
  status: string | null;
  priority: string | null;
  submitted_at: string | null;
  attachments_count: number;
  request_type: {
    name: string;
    icon: string | null;
  } | null;
}

export function BeneficiaryRequestsTab({
  beneficiaryId,
}: BeneficiaryRequestsTabProps) {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["beneficiary-requests", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(
          `
          *,
          request_type:request_types(name, icon)
        `
        )
        .eq("beneficiary_id", beneficiaryId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data as Request[];
    },
    enabled: !!beneficiaryId,
  });

  const getStatusBadge = (status: string | null) => {
    const config: Record<
      string,
      {
        label: string;
        icon: any;
        variant: "default" | "secondary" | "destructive" | "outline";
      }
    > = {
      "قيد المراجعة": { label: "قيد المراجعة", icon: Clock, variant: "secondary" },
      موافق: { label: "موافق عليه", icon: CheckCircle2, variant: "outline" },
      مرفوض: { label: "مرفوض", icon: XCircle, variant: "destructive" },
      معلق: { label: "معلق", icon: AlertCircle, variant: "default" },
    };

    const s = config[status || "معلق"] || config["معلق"];
    const Icon = s.icon;

    return (
      <Badge variant={s.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {s.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string | null) => {
    const config: Record<
      string,
      { variant: "default" | "secondary" | "destructive" }
    > = {
      عاجلة: { variant: "destructive" },
      مهمة: { variant: "default" },
      متوسطة: { variant: "secondary" },
      منخفضة: { variant: "secondary" },
    };

    const p = config[priority || "متوسطة"] || config["متوسطة"];
    return <Badge variant={p.variant}>{priority || "متوسطة"}</Badge>;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          الطلبات ({requests.length})
        </CardTitle>
        <RequestSubmissionDialog beneficiaryId={beneficiaryId} />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المرفقات</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-muted-foreground"
                  >
                    لا توجد طلبات
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.request_number || "—"}
                    </TableCell>
                    <TableCell>{request.request_type?.name || "—"}</TableCell>
                    <TableCell>
                      {request.amount
                        ? `${request.amount.toLocaleString("ar-SA")} ريال`
                        : "—"}
                    </TableCell>
                    <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                    <TableCell>
                      {request.submitted_at
                        ? format(new Date(request.submitted_at), "dd/MM/yyyy", {
                            locale: ar,
                          })
                        : "—"}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Paperclip className="h-3 w-3" />
                        {request.attachments_count || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          // سيتم فتح Dialog المرفقات
                        }}
                      >
                        <Paperclip className="h-4 w-4 ml-2" />
                        {request.attachments_count || 0}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
