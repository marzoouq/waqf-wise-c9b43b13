import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AlertCircle, Mail, Phone, DollarSign } from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { ar } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface RentalPayment {
  id: string;
  contract_id: string;
  due_date: string;
  amount_due: number;
  amount_paid: number | null;
  status: string;
  tenant_name?: string;
  tenant_phone?: string;
  tenant_email?: string;
  contract_number?: string;
}

interface ArrearsReportProps {
  payments: RentalPayment[];
}

export const ArrearsReport = ({ payments }: ArrearsReportProps) => {
  const { toast } = useToast();
  const today = new Date();

  // حساب المتأخرات
  const overduePayments = payments.filter((payment) => {
    const dueDate = new Date(payment.due_date);
    return payment.status === 'متأخر' && differenceInDays(today, dueDate) > 0;
  }).sort((a, b) => {
    const daysA = differenceInDays(today, new Date(a.due_date));
    const daysB = differenceInDays(today, new Date(b.due_date));
    return daysB - daysA; // الأقدم أولاً
  });

  const totalArrears = overduePayments.reduce((sum, payment) => {
    const remaining = payment.amount_due - (payment.amount_paid || 0);
    return sum + remaining;
  }, 0);

  const uniqueTenants = new Set(overduePayments.map(p => p.tenant_name)).size;

  const handleSendReminder = (payment: RentalPayment, method: 'email' | 'sms') => {
    toast({
      title: "تم إرسال التذكير",
      description: `تم إرسال تذكير ${method === 'email' ? 'بريد إلكتروني' : 'رسالة نصية'} إلى ${payment.tenant_name}`,
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    return differenceInDays(today, new Date(dueDate));
  };

  const getOverdueSeverity = (days: number) => {
    if (days > 90) return { label: "حرج جداً", color: "destructive" };
    if (days > 60) return { label: "حرج", color: "destructive" };
    if (days > 30) return { label: "تحذير", color: "warning" };
    return { label: "تأخر بسيط", color: "secondary" };
  };

  if (overduePayments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-4">
              <DollarSign className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold text-lg">لا توجد متأخرات!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              جميع الدفعات مسددة في موعدها
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* إحصائيات المتأخرات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المتأخرات</p>
                <p className="text-2xl font-bold text-destructive">
                  {totalArrears.toLocaleString('ar-SA')} ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد الدفعات المتأخرة</p>
                <p className="text-2xl font-bold">{overduePayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">عدد المستأجرين المتأخرين</p>
                <p className="text-2xl font-bold">{uniqueTenants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المتأخرات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            تفاصيل المتأخرات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم العقد</TableHead>
                  <TableHead>المستأجر</TableHead>
                  <TableHead>تاريخ الاستحقاق</TableHead>
                  <TableHead>الأيام المتأخرة</TableHead>
                  <TableHead>المبلغ المستحق</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overduePayments.map((payment) => {
                  const daysOverdue = getDaysOverdue(payment.due_date);
                  const severity = getOverdueSeverity(daysOverdue);
                  const remainingAmount = payment.amount_due - (payment.amount_paid || 0);

                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.contract_number || "---"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{payment.tenant_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {payment.tenant_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(payment.due_date), "dd MMM yyyy", { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={severity.color === "destructive" ? "destructive" : "secondary"}
                          className="gap-1"
                        >
                          <AlertCircle className="h-3 w-3" />
                          {daysOverdue} يوم
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-destructive">
                        {remainingAmount.toLocaleString('ar-SA')} ريال
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          {severity.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          {payment.tenant_email && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendReminder(payment, 'email')}
                              title="إرسال تذكير بالبريد"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          {payment.tenant_phone && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSendReminder(payment, 'sms')}
                              title="إرسال رسالة نصية"
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
