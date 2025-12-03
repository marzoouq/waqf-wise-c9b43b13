import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
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

interface EmergencyRequest {
  id: string;
  request_number: string;
  amount_requested: number;
  reason: string;
  urgency_level: string;
  status: string;
  sla_due_at: string;
  created_at: string;
  beneficiary_id: string;
  beneficiaries?: {
    full_name: string;
    national_id: string;
  };
}

export function EmergencyAidApprovalsTab() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<EmergencyRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvedAmount, setApprovedAmount] = useState(0);

  // جلب الطلبات المعلقة
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["emergency-approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_aid_requests")
        .select(`
          *,
          beneficiaries!inner(
            full_name,
            national_id
          )
        `)
        .eq("status", "معلق")
        .order("sla_due_at", { ascending: true });

      if (error) throw error;
      return data as EmergencyRequest[];
    },
  });

  // موافقة على الطلب
  const approveMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const { error } = await supabase
        .from("emergency_aid_requests")
        .update({
          status: "معتمد",
          amount_approved: amount,
          approved_at: new Date().toISOString(),
          notes: approvalNotes,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ تمت الموافقة",
        description: "تم الموافقة على الطلب بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["emergency-approvals"] });
      setSelectedRequest(null);
      setApprovalNotes("");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // رفض الطلب
  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("emergency_aid_requests")
        .update({
          status: "مرفوض",
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ تم الرفض",
        description: "تم رفض الطلب",
      });
      queryClient.invalidateQueries({ queryKey: ["emergency-approvals"] });
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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
                            onClick={() => {
                              setSelectedRequest(request);
                              setApprovedAmount(request.amount_requested);
                            }}
                          >
                            <CheckCircle className="h-3 w-3 ml-1" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setRejectionReason("");
                            }}
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
        open={!!selectedRequest && !rejectionReason}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
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
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              إلغاء
            </Button>
            <Button
              onClick={() =>
                selectedRequest &&
                approveMutation.mutate({ id: selectedRequest.id, amount: approvedAmount })
              }
              disabled={approveMutation.isPending}
            >
              تأكيد الموافقة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع الرفض */}
      <Dialog
        open={!!selectedRequest && !!rejectionReason}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setRejectionReason("");
          }
        }}
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
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRequest(null);
                setRejectionReason("");
              }}
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedRequest && rejectMutation.mutate(selectedRequest.id)}
              disabled={!rejectionReason || rejectMutation.isPending}
            >
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
