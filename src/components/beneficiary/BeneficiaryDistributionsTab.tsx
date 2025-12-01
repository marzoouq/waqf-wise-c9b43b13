import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Clock, CheckCircle2, DollarSign, LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface BeneficiaryDistributionsTabProps {
  beneficiaryId: string;
}

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export function BeneficiaryDistributionsTab({ beneficiaryId }: BeneficiaryDistributionsTabProps) {
  const { settings } = useVisibilitySettings();
  
  // استخدام payments بدلاً من distribution_allocations
  const { data: distributions = [], isLoading } = useQuery({
    queryKey: ["beneficiary-distributions-payments", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .eq("status", "مدفوع")
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const totalReceived = distributions.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const pendingAmount = 0; // سيتم حسابه من الطلبات المعلقة

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { icon: LucideIcon; variant: BadgeVariant }> = {
      "مدفوع": { icon: CheckCircle2, variant: "outline" },
      "معلق": { icon: Clock, variant: "secondary" },
      "قيد المعالجة": { icon: Clock, variant: "default" },
    };

    const s = config[status] || { icon: Clock, variant: "secondary" };
    const Icon = s.icon;

    return (
      <Badge variant={s.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التوزيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{distributions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">عدد التوزيعات الكلي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبالغ المدفوعة</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <MaskedValue
                value={totalReceived.toLocaleString("ar-SA")}
                type="amount"
                masked={settings?.mask_exact_amounts || false}
              /> ريال
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي ما تم استلامه</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبالغ المعلقة</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAmount.toLocaleString("ar-SA")} ريال</div>
            <p className="text-xs text-muted-foreground mt-1">قيد الانتظار</p>
          </CardContent>
        </Card>
      </div>

      {/* Distributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل التوزيعات</CardTitle>
          <CardDescription>جميع التوزيعات والمبالغ المخصصة لك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم التوزيع</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">المبلغ المخصص</TableHead>
                  <TableHead className="text-right">الخصومات</TableHead>
                  <TableHead className="text-right">صافي المبلغ</TableHead>
                  <TableHead className="text-right">حالة الدفع</TableHead>
                  <TableHead className="text-right">تاريخ الدفع</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">جاري التحميل...</TableCell>
                  </TableRow>
                ) : distributions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد توزيعات بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  distributions.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.reference_number || "—"}</TableCell>
                      <TableCell>
                        {payment.payment_date && format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell className="font-semibold">
                        <MaskedValue
                          value={Number(payment.amount || 0).toLocaleString("ar-SA")}
                          type="amount"
                          masked={settings?.mask_exact_amounts || false}
                        /> ريال
                      </TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell className="font-bold text-success">
                        <MaskedValue
                          value={Number(payment.amount || 0).toLocaleString("ar-SA")}
                          type="amount"
                          masked={settings?.mask_exact_amounts || false}
                        /> ريال
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status || "معلق")}</TableCell>
                      <TableCell>
                        {payment.payment_date 
                          ? format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ar })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
