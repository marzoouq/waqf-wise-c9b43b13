import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { format, arLocale as ar } from "@/lib/date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEmergencyAidApprovals, type EmergencyRequest } from "@/hooks/approvals/useEmergencyAidApprovals";

export function EmergencyAidApprovalsTab() {
  const { 
    requests, 
    isLoading, 
    approveRequest, 
    rejectRequest, 
    isApproving, 
    isRejecting 
  } = useEmergencyAidApprovals();
  
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [dialogMode, setDialogMode] = useState<"approve" | "reject" | null>(null);

  const handleApprove = async () => {
    if (!selectedRequest) return;
    await approveRequest({ 
      id: selectedRequest.id, 
      amount: approvedAmount,
      notes: approvalNotes 
    });
    closeDialog();
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    await rejectRequest({ 
      id: selectedRequest.id, 
      reason: rejectionReason 
    });
    closeDialog();
  };

  const closeDialog = () => {
    setSelectedRequest(null);
    setDialogMode(null);
    setApprovalNotes("");
    setRejectionReason("");
  };

  const openApproveDialog = (request: EmergencyRequest) => {
    setSelectedRequest(request);
    setApprovedAmount(request.amount_requested);
    setDialogMode("approve");
  };

  const openRejectDialog = (request: EmergencyRequest) => {
    setSelectedRequest(request);
    setDialogMode("reject");
  };

  const getUrgencyBadge = (level: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      "عاجل جداً": { variant: "destructive" },
      عاجل: { variant: "default" },
      متوسط: { variant: "secondary" },
    };
    return <Badge variant={config[level]?.variant || "secondary"}>{level}</Badge>;
  };

  const getSLAStatus = (slaDate: string) => {
    const now = new Date();
    const sla = new Date(slaDate);
    const hoursRemaining = (sla.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return <Badge variant="destructive">متأخر</Badge>;
    } else if (hoursRemaining < 2) {
      return <Badge variant="default">عاجل ({Math.floor(hoursRemaining)}س)</Badge>;
    } else {
      return <Badge variant="secondary">{Math.floor(hoursRemaining)} ساعة متبقية</Badge>;
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            طلبات الفزعة المعلقة ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">المستفيد</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">مستوى العجلة</TableHead>
                  <TableHead className="text-right">SLA</TableHead>
                  <TableHead className="text-right">تاريخ التقديم</TableHead>
                  <TableHead className="text-right">الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      لا توجد طلبات معلقة
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.request_number}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{request.beneficiaries?.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.beneficiaries?.national_id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {request.amount_requested.toLocaleString("ar-SA")} ريال
                      </TableCell>
                      <TableCell>{getUrgencyBadge(request.urgency_level)}</TableCell>
                      <TableCell>{getSLAStatus(request.sla_due_at)}</TableCell>
                      <TableCell>
                        {format(new Date(request.created_at), "dd/MM/yyyy - HH:mm", {
                          locale: ar,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => openApproveDialog(request)}
                          >
                            <CheckCircle className="h-3 w-3 ml-1" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectDialog(request)}
                          >
                            <XCircle className="h-3 w-3 ml-1" />
                            رفض
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* مربع الموافقة */}
      <Dialog
        open={dialogMode === "approve"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الموافقة على طلب الفزعة</DialogTitle>
            <DialogDescription>
              طلب رقم: {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">السبب:</label>
              <p className="text-sm text-muted-foreground mt-1">{selectedRequest?.reason}</p>
            </div>
            <div>
              <label className="text-sm font-medium">المبلغ المعتمد (ريال):</label>
              <input
                type="number"
                className="w-full mt-1 p-2 border rounded"
                value={approvedAmount}
                onChange={(e) => setApprovedAmount(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">ملاحظات:</label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              إلغاء
            </Button>
            <Button onClick={handleApprove} disabled={isApproving}>
              {isApproving ? "جاري المعالجة..." : "تأكيد الموافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع الرفض */}
      <Dialog
        open={dialogMode === "reject"}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض طلب الفزعة</DialogTitle>
            <DialogDescription>
              طلب رقم: {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">سبب الرفض:</label>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="اذكر سبب الرفض..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason || isRejecting}
            >
              {isRejecting ? "جاري المعالجة..." : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
