import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function OverdueReport() {
  const { data: overdueData, isLoading } = useQuery({
    queryKey: ["overdue_report"],
    queryFn: async () => {
      // الفواتير المتأخرة
      const { data: invoices } = await supabase
        .from("invoices")
        .select("*")
        .in("status", ["sent", "partially_paid"])
        .lt("due_date", new Date().toISOString());

      // الأقساط المتأخرة
      const { data: installments } = await supabase
        .from("loan_installments")
        .select(`
          *,
          loans(loan_number, beneficiaries(full_name))
        `)
        .in("status", ["pending", "partial"])
        .lt("due_date", new Date().toISOString());

      // الإيجارات المتأخرة
      const { data: rentals } = await supabase
        .from("rental_payments")
        .select(`
          *,
          contracts(tenant_name, properties(name))
        `)
        .in("status", ["معلق", "متأخر"])
        .lt("due_date", new Date().toISOString());

      return {
        invoices: invoices || [],
        installments: installments || [],
        rentals: rentals || []
      };
    },
  });

  const calculateDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - due.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalOverdue = () => {
    const invoicesTotal = overdueData?.invoices.reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0) || 0;
    const installmentsTotal = overdueData?.installments.reduce((sum: number, inst: any) => sum + Number(inst.remaining_amount || inst.total_amount), 0) || 0;
    const rentalsTotal = overdueData?.rentals.reduce((sum: number, rent: any) => sum + Number(rent.amount_due - rent.amount_paid), 0) || 0;
    
    return invoicesTotal + installmentsTotal + rentalsTotal;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المتأخرات</p>
                <p className="text-xl font-bold text-destructive">
                  {getTotalOverdue().toLocaleString("ar-SA")} ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">فواتير متأخرة</p>
                <p className="text-xl font-bold">{overdueData?.invoices.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">أقساط متأخرة</p>
                <p className="text-xl font-bold">{overdueData?.installments.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إيجارات متأخرة</p>
                <p className="text-xl font-bold">{overdueData?.rentals.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الفواتير المتأخرة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            الفواتير المتأخرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>أيام التأخير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueData?.invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    لا توجد فواتير متأخرة
                  </TableCell>
                </TableRow>
              ) : (
                overdueData?.invoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell>{invoice.total_amount.toLocaleString("ar-SA")} ر.س</TableCell>
                    <TableCell>
                      {format(new Date(invoice.due_date), "dd MMM yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {calculateDaysOverdue(invoice.due_date)} يوم
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* الأقساط المتأخرة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            الأقساط المتأخرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم القرض</TableHead>
                <TableHead>المستفيد</TableHead>
                <TableHead>رقم القسط</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>أيام التأخير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overdueData?.installments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    لا توجد أقساط متأخرة
                  </TableCell>
                </TableRow>
              ) : (
                overdueData?.installments.map((installment: any) => (
                  <TableRow key={installment.id}>
                    <TableCell className="font-medium">
                      {installment.loans?.loan_number}
                    </TableCell>
                    <TableCell>{installment.loans?.beneficiaries?.full_name}</TableCell>
                    <TableCell>{installment.installment_number}</TableCell>
                    <TableCell>
                      {(installment.remaining_amount || installment.total_amount).toLocaleString("ar-SA")} ر.س
                    </TableCell>
                    <TableCell>
                      {format(new Date(installment.due_date), "dd MMM yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        {calculateDaysOverdue(installment.due_date)} يوم
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
