import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { RequestSubmissionDialog } from "@/components/beneficiary/RequestSubmissionDialog";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BeneficiaryRequestsTabProps {
  beneficiaryId: string;
}

export function BeneficiaryRequestsTab({ beneficiaryId }: BeneficiaryRequestsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["beneficiary-requests", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(`
          *,
          request_types (
            name_ar,
            icon,
            requires_amount
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: any; variant: "default" | "secondary" | "destructive" | "outline" }> = {
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
    return <Badge variant={s.variant}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>طلباتي ({requests.length})</CardTitle>
            <CardDescription>جميع الطلبات المقدمة مع حالتها الحالية</CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 ml-2" />
            طلب جديد
          </Button>
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
                  <TableHead className="text-right">تاريخ التقديم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">جاري التحميل...</TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد طلبات مقدمة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number || "—"}</TableCell>
                      <TableCell>
                        {(request.request_types as any)?.name_ar || "—"}
                      </TableCell>
                      <TableCell>
                        {request.amount 
                          ? `${Number(request.amount).toLocaleString("ar-SA")} ريال`
                          : "—"}
                      </TableCell>
                      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                      <TableCell>
                        {request.created_at && format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status || "معلق")}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RequestSubmissionDialog 
        beneficiaryId={beneficiaryId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
