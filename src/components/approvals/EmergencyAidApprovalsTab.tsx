import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
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
    error,
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
    return <LoadingState message="جاري تحميل طلبات الفزعة..." />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <p className="text-destructive font-medium">فشل تحميل طلبات الفزعة</p>
          <p className="text-muted-foreground text-sm mt-1">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden border-border/50">
        <CardHeader className="bg-gradient-to-l from-rose-50 to-transparent dark:from-rose-950/30 dark:to-transparent border-b border-border/30">
          <CardTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
            طلبات الفزعة المعلقة ({requests.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-border/50">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات معلقة</p>
                <p className="text-sm text-muted-foreground/70 mt-1">ستظهر الطلبات العاجلة هنا</p>
              </div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium">{request.request_number}</span>
                    <div className="flex gap-2">
                      {getUrgencyBadge(request.urgency_level)}
                      {getSLAStatus(request.sla_due_at)}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{request.beneficiaries?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{request.beneficiaries?.national_id}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{request.amount_requested.toLocaleString("ar-SA")} ريال</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ar })}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="default" className="flex-1 gap-1" onClick={() => openApproveDialog(request)}>
                      <CheckCircle className="h-3 w-3" />
                      موافقة
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => openRejectDialog(request)}>
                      <XCircle className="h-3 w-3" />
                      رفض
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="rounded-lg border-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-start font-semibold">رقم الطلب</TableHead>
                    <TableHead className="text-start font-semibold">المستفيد</TableHead>
                    <TableHead className="text-start font-semibold">المبلغ</TableHead>
                    <TableHead className="text-start font-semibold">مستوى العجلة</TableHead>
                    <TableHead className="text-start font-semibold hidden lg:table-cell">SLA</TableHead>
                    <TableHead className="text-start font-semibold hidden lg:table-cell">تاريخ التقديم</TableHead>
                    <TableHead className="text-start font-semibold">الإجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16">
                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                          <Clock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium text-muted-foreground">لا توجد طلبات معلقة</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-medium">{request.request_number}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.beneficiaries?.full_name}</div>
                            <div className="text-xs text-muted-foreground">
                              {request.beneficiaries?.national_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {request.amount_requested.toLocaleString("ar-SA")} ريال
                        </TableCell>
                        <TableCell>{getUrgencyBadge(request.urgency_level)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{getSLAStatus(request.sla_due_at)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(new Date(request.created_at), "dd/MM/yyyy - HH:mm", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="gap-1"
                              onClick={() => openApproveDialog(request)}
                            >
                              <CheckCircle className="h-3 w-3" />
                              موافقة
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => openRejectDialog(request)}
                            >
                              <XCircle className="h-3 w-3" />
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
                className="w-full mt-1 p-2 border rounded-lg"
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
