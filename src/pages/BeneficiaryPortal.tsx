import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { LoadingState } from "@/components/shared/LoadingState";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface EmergencyRequest {
  id: string;
  request_number: string;
  amount_requested: number;
  amount_approved: number | null;
  reason: string;
  urgency_level: string;
  status: string;
  sla_due_at: string | null;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
}

export default function BeneficiaryPortal() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // جلب بيانات المستفيد
  const { data: beneficiary } = useQuery({
    queryKey: ["current-beneficiary"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("غير مصرح");

      const { data, error } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // جلب طلبات الفزعة
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["emergency-requests", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      const { data, error } = await supabase
        .from("emergency_aid_requests")
        .select("*")
        .eq("beneficiary_id", beneficiary.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmergencyRequest[];
    },
    enabled: !!beneficiary?.id,
  });

  // إرسال طلب جديد
  const submitRequestMutation = useMutation({
    mutationFn: async (formData: {
      amount: number;
      reason: string;
      urgency: string;
    }) => {
      if (!beneficiary?.id) throw new Error("معرف المستفيد مفقود");

      const { error } = await supabase.from("emergency_aid_requests").insert({
        beneficiary_id: beneficiary.id,
        amount_requested: formData.amount,
        reason: formData.reason,
        urgency_level: formData.urgency,
        status: "معلق",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ تم إرسال الطلب",
        description: "سيتم مراجعة طلبك في أقرب وقت",
      });
      queryClient.invalidateQueries({ queryKey: ["emergency-requests"] });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    submitRequestMutation.mutate({
      amount: Number(formData.get("amount")),
      reason: formData.get("reason") as string,
      urgency: formData.get("urgency") as string,
    });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      { label: string; icon: any; variant: "default" | "secondary" | "destructive" | "outline" }
    > = {
      معلق: { label: "معلق", icon: Clock, variant: "secondary" },
      "قيد المراجعة": { label: "قيد المراجعة", icon: FileText, variant: "default" },
      معتمد: { label: "معتمد", icon: CheckCircle2, variant: "outline" },
      مرفوض: { label: "مرفوض", icon: XCircle, variant: "destructive" },
      مدفوع: { label: "مدفوع", icon: CheckCircle2, variant: "outline" },
    };

    const s = config[status] || { label: status, icon: AlertCircle, variant: "secondary" };
    const Icon = s.icon;

    return (
      <Badge variant={s.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {s.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (level: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" }> = {
      "عاجل جداً": { variant: "destructive" },
      عاجل: { variant: "default" },
      متوسط: { variant: "secondary" },
    };

    const s = config[level] || { variant: "secondary" };
    return <Badge variant={s.variant}>{level}</Badge>;
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <MobileOptimizedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">بوابة المستفيد</h1>
          <p className="text-muted-foreground mt-2">تقديم طلبات الفزعة ومتابعة الطلبات السابقة</p>
        </div>

        {/* نموذج طلب جديد */}
        <Card>
          <CardHeader>
            <CardTitle>تقديم طلب فزعة طارئة</CardTitle>
            <CardDescription>
              املأ النموذج أدناه لتقديم طلب فزعة. سيتم مراجعة الطلب والرد عليه حسب مستوى الأولوية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ المطلوب (ريال)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    min="100"
                    max="50000"
                    required
                    placeholder="مثال: 5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urgency">مستوى العجلة</Label>
                  <Select name="urgency" required>
                    <SelectTrigger id="urgency">
                      <SelectValue placeholder="اختر مستوى العجلة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عاجل جداً">عاجل جداً (4 ساعات)</SelectItem>
                      <SelectItem value="عاجل">عاجل (24 ساعة)</SelectItem>
                      <SelectItem value="متوسط">متوسط (3 أيام)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">سبب الطلب</Label>
                <Textarea
                  id="reason"
                  name="reason"
                  required
                  rows={4}
                  placeholder="يرجى ذكر سبب الحاجة للمساعدة بالتفصيل..."
                />
              </div>

              <Button type="submit" disabled={submitRequestMutation.isPending} className="w-full">
                {submitRequestMutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* الطلبات السابقة */}
        <Card>
          <CardHeader>
            <CardTitle>طلباتي السابقة ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">المبلغ المطلوب</TableHead>
                    <TableHead className="text-right">المبلغ المعتمد</TableHead>
                    <TableHead className="text-right">مستوى العجلة</TableHead>
                    <TableHead className="text-right">تاريخ التقديم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        لا توجد طلبات سابقة
                      </TableCell>
                    </TableRow>
                  ) : (
                    requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.request_number}</TableCell>
                        <TableCell>{request.amount_requested.toLocaleString("ar-SA")} ريال</TableCell>
                        <TableCell>
                          {request.amount_approved
                            ? `${request.amount_approved.toLocaleString("ar-SA")} ريال`
                            : "—"}
                        </TableCell>
                        <TableCell>{getUrgencyBadge(request.urgency_level)}</TableCell>
                        <TableCell>
                          {format(new Date(request.created_at), "dd/MM/yyyy - HH:mm", {
                            locale: ar,
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileOptimizedLayout>
  );
}
