import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";

interface BeneficiaryStatementsTabProps {
  beneficiaryId: string;
}

export function BeneficiaryStatementsTab({ beneficiaryId }: BeneficiaryStatementsTabProps) {
  const { settings } = useVisibilitySettings();
  
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["beneficiary-payments", beneficiaryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const totalReceived = payments
    .filter(p => p.status === 'مدفوع')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const handleExport = () => {
    // TODO: تنفيذ تصدير كشف الحساب
    console.log("Export statement");
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>كشف الحساب</CardTitle>
            <CardDescription>جميع المدفوعات المستلمة</CardDescription>
          </div>
          {settings?.allow_export_pdf && (
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 ml-2" />
              تصدير PDF
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المستلم</p>
                <p className="text-2xl font-bold">
                  <MaskedValue
                    value={totalReceived.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_exact_amounts || false}
                  /> ريال
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-info/10">
                <TrendingDown className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد المدفوعات</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم المرجع</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">الوصف</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">طريقة الدفع</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">جاري التحميل...</TableCell>
                  </TableRow>
                ) : payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد مدفوعات بعد
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">
                        {payment.reference_number || "—"}
                      </TableCell>
                      <TableCell>
                        {payment.payment_date && format(new Date(payment.payment_date), "dd/MM/yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>{payment.description || "—"}</TableCell>
                      <TableCell className="font-semibold">
                        <MaskedValue
                          value={Number(payment.amount).toLocaleString("ar-SA")}
                          type="amount"
                          masked={settings?.mask_exact_amounts || false}
                        /> ريال
                      </TableCell>
                      <TableCell>{payment.payment_method || "—"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'مدفوع' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {payment.status}
                        </span>
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
