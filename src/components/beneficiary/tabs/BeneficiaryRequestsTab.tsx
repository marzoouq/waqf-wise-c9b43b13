import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Eye, LucideIcon } from "lucide-react";
import { RequestSubmissionDialog } from "../RequestSubmissionDialog";
import { RequestDetailsDialog } from "../RequestDetailsDialog";
import { RequestAttachmentsUploader } from "../RequestAttachmentsUploader";
import { SLAIndicator } from "../SLAIndicator";
import { useBeneficiaryRequestsTab } from "@/hooks/beneficiary/useBeneficiaryTabsData";
import { format, arLocale as ar } from "@/lib/date";

interface BeneficiaryRequestsTabProps {
  beneficiaryId: string;
}

interface RequestType {
  name_ar: string;
  requires_amount?: boolean;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function BeneficiaryRequestsTab({ beneficiaryId }: BeneficiaryRequestsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useBeneficiaryRequestsTab(beneficiaryId);

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
                    <TableCell colSpan={9} className="text-center">جاري التحميل...</TableCell>
                  </TableRow>
                ) : requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      لا توجد طلبات مقدمة بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number || "—"}</TableCell>
                      <TableCell>
                        {(request.request_types as RequestType | null)?.name_ar || "—"}
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
                      <TableCell>
                        <RequestAttachmentsUploader
                          requestId={request.id}
                          attachmentsCount={request.attachments_count || 0}
                        />
                      </TableCell>
                      <TableCell>
                        {request.created_at && format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status || "معلق")}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRequestId(request.id)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
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

      <RequestSubmissionDialog 
        beneficiaryId={beneficiaryId}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      {selectedRequestId && (
        <RequestDetailsDialog
          requestId={selectedRequestId}
          isOpen={!!selectedRequestId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  );
}
