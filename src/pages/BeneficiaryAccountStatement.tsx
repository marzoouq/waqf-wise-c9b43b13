import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Filter, Search, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  description: string | null;
  payment_method: string | null;
}

export default function BeneficiaryAccountStatement() {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');

  // جلب بيانات المستفيد
  const { data: beneficiary } = useQuery({
    queryKey: ['my-beneficiary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, beneficiary_number, account_balance, total_received')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // جلب المدفوعات
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['beneficiary-payments', beneficiary?.id, dateFrom, dateTo, paymentMethod],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      let query = supabase
        .from('payments')
        .select('id, amount, payment_date, description, payment_method')
        .eq('beneficiary_id', beneficiary.id)
        .order('payment_date', { ascending: false });

      if (dateFrom) {
        query = query.gte('payment_date', dateFrom);
      }
      if (dateTo) {
        query = query.lte('payment_date', dateTo);
      }
      if (paymentMethod && paymentMethod !== 'all') {
        query = query.eq('payment_method', paymentMethod);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data as Payment[];
    },
    enabled: !!beneficiary?.id,
  });

  // تصفية المدفوعات حسب البحث
  const filteredPayments = payments.filter(payment => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      payment.description?.toLowerCase().includes(searchLower) ||
      payment.payment_method?.toLowerCase().includes(searchLower)
    );
  });

  // حساب الإحصائيات
  const stats = {
    totalPayments: filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    paymentsCount: filteredPayments.length,
    avgPayment: filteredPayments.length > 0 
      ? filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0) / filteredPayments.length 
      : 0,
    largestPayment: filteredPayments.length > 0 
      ? Math.max(...filteredPayments.map(p => Number(p.amount))) 
      : 0,
  };

  // تصدير PDF
  const exportToPDF = async () => {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const autoTable = autoTableModule.default;
    const doc = new jsPDF();
    
    // Add Arabic font support
    doc.setR2L(true);
    doc.setFont('helvetica');
    
    // العنوان
    doc.setFontSize(18);
    doc.text('كشف حساب المستفيد', 105, 20, { align: 'center' });
    
    // معلومات المستفيد
    doc.setFontSize(12);
    doc.text(`الاسم: ${beneficiary?.full_name || ''}`, 20, 35);
    doc.text(`رقم المستفيد: ${beneficiary?.beneficiary_number || ''}`, 20, 45);
    doc.text(`التاريخ: ${format(new Date(), 'dd/MM/yyyy', { locale: ar })}`, 20, 55);
    
    // الإحصائيات
    doc.setFontSize(10);
    doc.text(`إجمالي المدفوعات: ${formatCurrency(stats.totalPayments)}`, 20, 70);
    doc.text(`عدد المدفوعات: ${stats.paymentsCount}`, 20, 78);
    doc.text(`متوسط الدفعة: ${formatCurrency(stats.avgPayment)}`, 20, 86);
    
    // الجدول
    const tableData = filteredPayments.map(payment => [
      format(new Date(payment.payment_date), 'dd/MM/yyyy'),
      payment.description || '-',
      formatCurrency(payment.amount),
      payment.payment_method || '-',
    ]);
    
    doc.autoTable({
      startY: 95,
      head: [['التاريخ', 'الوصف', 'المبلغ', 'طريقة الدفع']],
      body: tableData,
      styles: { font: 'helvetica', fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105] },
      margin: { top: 95 },
    });
    
    doc.save(`كشف-حساب-${beneficiary?.beneficiary_number || 'مستفيد'}.pdf`);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل كشف الحساب..." />;
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            كشف الحساب التفصيلي
          </h1>
          <p className="text-muted-foreground mt-1">
            عرض تفصيلي لجميع المعاملات المالية
          </p>
        </div>
        <Button onClick={exportToPDF} variant="outline">
          <Download className="h-4 w-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* بيانات المستفيد */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <CardHeader>
          <CardTitle>بيانات الحساب</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">الاسم الكامل</p>
            <p className="text-lg font-semibold">{beneficiary?.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">رقم المستفيد</p>
            <p className="text-lg font-semibold font-mono">{beneficiary?.beneficiary_number}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">إجمالي المستلم</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(beneficiary?.total_received || 0)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              إجمالي الفترة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalPayments)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              عدد المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paymentsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              متوسط الدفعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgPayment)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              أكبر دفعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(stats.largestPayment)}</div>
          </CardContent>
        </Card>
      </div>

      {/* الفلاتر */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            تصفية المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ابحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateFrom">من تاريخ</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dateTo">إلى تاريخ</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod">طريقة الدفع</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                  <SelectItem value="نقدي">نقدي</SelectItem>
                  <SelectItem value="شيك">شيك</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(dateFrom || dateTo || searchTerm || paymentMethod !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
                setSearchTerm('');
                setPaymentMethod('all');
              }}
              className="mt-4"
            >
              إعادة تعيين الفلاتر
            </Button>
          )}
        </CardContent>
      </Card>

      {/* جدول المدفوعات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المدفوعات</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">لا توجد مدفوعات مطابقة للفلتر</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead className="text-left">المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{payment.description || '-'}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs bg-muted">
                          {payment.payment_method || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <span className="font-semibold text-success">
                          {formatCurrency(payment.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
