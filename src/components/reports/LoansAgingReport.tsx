import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, AlertTriangle } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { exportToExcel, exportToPDF } from '@/lib/exportHelpers';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LoanAgingData {
  loan_id: string;
  loan_number: string;
  beneficiary_name: string;
  principal_amount: number;
  total_paid: number;
  remaining_balance: number;
  days_overdue: number;
  aging_category: string;
}

export function LoansAgingReport() {
  const { toast } = useToast();

  // بيانات أعمار الديون
  const { data: agingData, isLoading } = useQuery<LoanAgingData[]>({
    queryKey: ['loans-aging'],
    queryFn: async () => {
      const { data: loans, error } = await supabase
        .from('loans')
        .select(`
          id,
          loan_number,
          loan_amount,
          start_date,
          status,
          beneficiaries!inner(full_name)
        `)
        .in('status', ['active', 'defaulted']);
      
      if (error) throw error;

      // حساب أيام التأخير
      const agingData = await Promise.all(
        loans.map(async (loan) => {
          // جلب الأقساط المتأخرة والمدفوعات
          const [overdueResult, paymentsResult] = await Promise.all([
            supabase
              .from('loan_installments')
              .select('due_date')
              .eq('loan_id', loan.id)
              .eq('status', 'overdue')
              .order('due_date', { ascending: true })
              .limit(1),
            supabase
              .from('loan_installments')
              .select('principal_amount, paid_amount')
              .eq('loan_id', loan.id)
          ]);

          const oldestOverdue = overdueResult.data?.[0];
          const daysOverdue = oldestOverdue 
            ? Math.floor((new Date().getTime() - new Date(oldestOverdue.due_date).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

          // حساب المبالغ
          const installments = paymentsResult.data || [];
          const totalPaid = installments.reduce((sum, inst) => sum + Number(inst.paid_amount || 0), 0);
          const remainingBalance = Number(loan.loan_amount) - totalPaid;

          // تصنيف العمر
          let agingCategory = 'حديث (0-30 يوم)';
          if (daysOverdue > 90) agingCategory = 'خطير (90+ يوم)';
          else if (daysOverdue > 60) agingCategory = 'متأخر جداً (60-90 يوم)';
          else if (daysOverdue > 30) agingCategory = 'متأخر (30-60 يوم)';

          return {
            loan_id: loan.id,
            loan_number: loan.loan_number,
            beneficiary_name: (loan.beneficiaries as any).full_name,
            principal_amount: Number(loan.loan_amount),
            total_paid: totalPaid,
            remaining_balance: remainingBalance,
            days_overdue: daysOverdue,
            aging_category: agingCategory
          };
        })
      );

      return agingData.sort((a, b) => b.days_overdue - a.days_overdue);
    },
  });

  // تجميع البيانات حسب الفئة
  const { data: agingByCategory } = useQuery({
    queryKey: ['loans-aging-categories', agingData],
    queryFn: async () => {
      if (!agingData) return [];

      const categories = agingData.reduce((acc, loan) => {
        if (!acc[loan.aging_category]) {
          acc[loan.aging_category] = { category: loan.aging_category, count: 0, amount: 0 };
        }
        acc[loan.aging_category].count += 1;
        acc[loan.aging_category].amount += loan.remaining_balance;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(categories);
    },
    enabled: !!agingData,
  });

  const handleExportPDF = () => {
    if (!agingData) return;

    const headers = ['رقم القرض', 'المستفيد', 'المبلغ الأصلي', 'المدفوع', 'المتبقي', 'أيام التأخير', 'الفئة'];
    const data = agingData.map(l => [
      l.loan_number,
      l.beneficiary_name,
      `${l.principal_amount.toLocaleString('ar-SA')} ريال`,
      `${l.total_paid.toLocaleString('ar-SA')} ريال`,
      `${l.remaining_balance.toLocaleString('ar-SA')} ريال`,
      l.days_overdue,
      l.aging_category
    ]);

    exportToPDF('تقرير أعمار الديون', headers, data, 'loans_aging');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير أعمار الديون بنجاح',
    });
  };

  const handleExportExcel = () => {
    if (!agingData) return;

    const data = agingData.map(l => ({
      'رقم القرض': l.loan_number,
      'اسم المستفيد': l.beneficiary_name,
      'المبلغ الأصلي': l.principal_amount,
      'المبلغ المدفوع': l.total_paid,
      'الرصيد المتبقي': l.remaining_balance,
      'أيام التأخير': l.days_overdue,
      'فئة العمر': l.aging_category
    }));

    exportToExcel(data, 'loans_aging', 'أعمار الديون');
    
    toast({
      title: 'تم التصدير',
      description: 'تم تصدير تقرير أعمار الديون بنجاح',
    });
  };

  if (isLoading) {
    return <LoadingState message="جاري تحليل أعمار الديون..." />;
  }

  return (
    <div className="space-y-6">
      {/* التحليل البياني */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            تحليل أعمار الديون
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agingByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="عدد القروض" />
              <Bar dataKey="amount" fill="#82ca9d" name="المبلغ المتبقي" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* الجدول التفصيلي */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل القروض حسب أيام التأخير</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القرض</TableHead>
                  <TableHead>المستفيد</TableHead>
                  <TableHead>المبلغ الأصلي</TableHead>
                  <TableHead>المتبقي</TableHead>
                  <TableHead>أيام التأخير</TableHead>
                  <TableHead>الفئة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData?.map((loan) => (
                  <TableRow key={loan.loan_id}>
                    <TableCell className="font-medium">{loan.loan_number}</TableCell>
                    <TableCell>{loan.beneficiary_name}</TableCell>
                    <TableCell>{loan.principal_amount.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell className="font-bold">{loan.remaining_balance.toLocaleString('ar-SA')} ريال</TableCell>
                    <TableCell>
                      <Badge variant={loan.days_overdue > 60 ? 'destructive' : loan.days_overdue > 30 ? 'default' : 'secondary'}>
                        {loan.days_overdue} يوم
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        loan.aging_category.includes('خطير') ? 'destructive' :
                        loan.aging_category.includes('متأخر جداً') ? 'destructive' :
                        loan.aging_category.includes('متأخر') ? 'default' : 'secondary'
                      }>
                        {loan.aging_category}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
