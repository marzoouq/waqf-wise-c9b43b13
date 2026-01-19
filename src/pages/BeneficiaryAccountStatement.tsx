import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Filter, Search, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useBeneficiaryAccountStatementData } from '@/hooks/beneficiary/useBeneficiaryAccountStatementData';
import { loadArabicFontToPDF, addWaqfHeader, addWaqfFooter, getDefaultTableStyles, WAQF_COLORS, formatCurrencyForPDF } from '@/lib/pdf/arabic-pdf-utils';

export default function BeneficiaryAccountStatement() {
  const { user } = useAuth();
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('all');

  const { beneficiary, payments, isLoading, error, refetch, calculateStats } = useBeneficiaryAccountStatementData(
    user?.id,
    { dateFrom, dateTo, paymentMethod }
  );

  // تصفية المدفوعات حسب البحث
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        payment.description?.toLowerCase().includes(searchLower) ||
        payment.payment_method?.toLowerCase().includes(searchLower)
      );
    });
  }, [payments, searchTerm]);

  const stats = calculateStats(filteredPayments);

  // تصدير PDF مع الخط العربي
  const exportToPDF = async () => {
    const [jsPDFModule, autoTableModule] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);
    
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF();
    
    // تحميل الخط العربي
    const fontName = await loadArabicFontToPDF(doc);
    
    // إضافة ترويسة الوقف
    let yPos = addWaqfHeader(doc, fontName, 'كشف حساب المستفيد');
    
    // معلومات المستفيد
    doc.setFont(fontName, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    const pageWidth = doc.internal.pageSize.width;
    doc.text(`الاسم: ${beneficiary?.full_name || ''}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 7;
    doc.text(`رقم المستفيد: ${beneficiary?.beneficiary_number || ''}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 7;
    doc.text(`التاريخ: ${format(new Date(), 'dd/MM/yyyy', { locale: ar })}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 10;
    
    // الإحصائيات
    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...WAQF_COLORS.primary);
    doc.text('الملخص المالي', pageWidth - 20, yPos, { align: 'right' });
    yPos += 7;
    
    doc.setFont(fontName, 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`إجمالي المدفوعات: ${formatCurrencyForPDF(stats.totalPayments)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`عدد المدفوعات: ${stats.paymentsCount}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`متوسط الدفعة: ${formatCurrencyForPDF(stats.avgPayment)}`, pageWidth - 20, yPos, { align: 'right' });
    yPos += 10;
    
    // الجدول
    const tableData = filteredPayments.map(payment => [
      format(new Date(payment.payment_date), 'dd/MM/yyyy'),
      payment.description || '-',
      formatCurrencyForPDF(payment.amount),
      payment.payment_method || '-',
    ]);
    
    const tableStyles = getDefaultTableStyles(fontName);
    
    (doc as unknown as { autoTable: (options: unknown) => void }).autoTable({
      startY: yPos,
      head: [['التاريخ', 'الوصف', 'المبلغ', 'طريقة الدفع']],
      body: tableData,
      ...tableStyles,
      margin: { bottom: 30 },
      didDrawPage: () => {
        addWaqfFooter(doc, fontName);
      },
    });
    
    doc.save(`كشف-حساب-${beneficiary?.beneficiary_number || 'مستفيد'}.pdf`);
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل كشف الحساب..." />;
  }

  if (error) {
    return <ErrorState title="خطأ في التحميل" message="فشل تحميل كشف الحساب" onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8 space-y-4 sm:space-y-5 md:space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8" />
            كشف الحساب التفصيلي
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            عرض تفصيلي لجميع المعاملات المالية
          </p>
        </div>
        <Button onClick={exportToPDF} variant="outline" size="sm" className="w-full sm:w-auto">
          <Download className="h-4 w-4 ms-2" />
          <span className="hidden sm:inline">تصدير PDF</span>
          <span className="sm:hidden">تصدير</span>
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
                  className="pe-9"
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
                  className="pe-9"
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
                  className="pe-9"
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
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="p-4 rounded-lg border border-border/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{payment.description || '-'}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(payment.payment_date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                      <span className="font-semibold text-success">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center rounded-full px-2 py-1 bg-muted">
                        {payment.payment_method || '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>التاريخ</TableHead>
                      <TableHead>الوصف</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead className="text-start">المبلغ</TableHead>
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
                        <TableCell className="text-start">
                          <span className="font-semibold text-success">
                            {formatCurrency(payment.amount)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
