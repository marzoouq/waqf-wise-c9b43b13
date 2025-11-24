import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { RequestWithBeneficiary, StatusConfigMap } from "@/types/approvals";
import { RequestService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function RequestApprovalsTab() {
  const [selectedRequest, setSelectedRequest] = useState<RequestWithBeneficiary | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: requests, isLoading } = useQuery<RequestWithBeneficiary[]>({
    queryKey: ["requests_with_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(`
          *,
          beneficiaries(full_name, national_id),
          request_types(name_ar, name)
        `)
        .in("status", ["قيد المراجعة", "معلق"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as RequestWithBeneficiary[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRequest) return;
      return RequestService.approve(
        selectedRequest.id,
        'current-user-id', // يجب استبداله بالـ auth.uid() الفعلي
        'الموظف',
        notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests_with_approvals"] });
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على الطلب بنجاح",
      });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setNotes("");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRequest) return;
      return RequestService.reject(
        selectedRequest.id,
        'current-user-id',
        'الموظف',
        rejectionReason
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests_with_approvals"] });
      toast({
        title: "تم الرفض",
        description: "تم رفض الطلب",
      });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
  });

  const getStatusBadge = (status: string) => {
    const config: StatusConfigMap = {
      "قيد المراجعة": { label: "قيد المراجعة", variant: "secondary", icon: Clock },
      "موافق عليه": { label: "موافق عليه", variant: "default", icon: CheckCircle },
      "مرفوض": { label: "مرفوض", variant: "destructive", icon: XCircle },
    };
    const c = config[status] || config["قيد المراجعة"];
    const Icon = c.icon;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {c.label}
      </Badge>
    );
  };

  const getApprovalProgress = (approvals: { status: string }[] | undefined) => {
    const total = 3;
    const approved = approvals?.filter((a) => a.status === "موافق").length || 0;
    return `${approved}/${total}`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests?.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{request.request_number}</CardTitle>
              {getStatusBadge(request.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">نوع الطلب</p>
                <p className="text-base font-semibold">{request.request_types?.name_ar}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المستفيد</p>
                <p className="text-base">{request.beneficiaries?.full_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الطلب</p>
                <p className="text-base">
                  {format(new Date(request.submitted_at), "dd MMM yyyy", { locale: ar })}
                </p>
              </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setSelectedRequest(request);
                  setApproveDialogOpen(true);
                }}
                disabled={request.status !== 'قيد المراجعة'}
              >
                <CheckCircle className="h-4 w-4 ml-1" />
                موافقة
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setSelectedRequest(request);
                  setRejectDialogOpen(true);
                }}
                disabled={request.status !== 'قيد المراجعة'}
              >
                <XCircle className="h-4 w-4 ml-1" />
                رفض
              </Button>
            </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-1">الوصف:</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {requests?.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد طلبات بحاجة للموافقة</p>
          </CardContent>
        </Card>
      )}

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>الموافقة على الطلب</DialogTitle>
            <DialogDescription>
              أنت على وشك الموافقة على الطلب {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي ملاحظات..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? "جاري المعالجة..." : "تأكيد الموافقة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
            <DialogDescription>
              أنت على وشك رفض الطلب {selectedRequest?.request_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">سبب الرفض *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="يرجى كتابة سبب الرفض..."
                rows={3}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate()}
              disabled={!rejectionReason || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "جاري المعالجة..." : "تأكيد الرفض"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}