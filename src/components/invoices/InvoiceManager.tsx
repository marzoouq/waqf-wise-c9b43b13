import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Eye, Send, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export function InvoiceManager() {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
    const statusMap: Record<string, { label: string; variant: BadgeVariant }> = {
      draft: { label: 'مسودة', variant: 'secondary' },
      pending: { label: 'معلق', variant: 'default' },
      paid: { label: 'مدفوع', variant: 'default' },
      overdue: { label: 'متأخر', variant: 'destructive' },
      cancelled: { label: 'ملغي', variant: 'secondary' },
    };

    const info = statusMap[status] || { label: status, variant: 'secondary' };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const getZatcaStatusBadge = (status: string | null, isCompliant: boolean) => {
    if (!status) return <Badge variant="secondary">غير مرسل</Badge>;
    
    if (status === 'accepted') {
      return <Badge className="bg-green-600">موافق عليه ✓</Badge>;
    } else if (status === 'submitted') {
      return <Badge variant="default">قيد المراجعة</Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive">مرفوض</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">جاري التحميل...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              إدارة الفواتير الإلكترونية
            </CardTitle>
            <CardDescription>
              إنشاء وإدارة الفواتير المتوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            فاتورة جديدة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الفاتورة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>ZATCA</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!invoices || invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    لا توجد فواتير
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                    <TableCell>
                      {new Date(invoice.invoice_date).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell className="font-medium">{invoice.customer_name}</TableCell>
                    <TableCell>{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      {getZatcaStatusBadge(invoice.zatca_status, invoice.is_zatca_compliant || false)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.zatca_status !== 'accepted' && (
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">إجمالي الفواتير</div>
              <div className="text-2xl font-bold">{invoices?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">متوافق مع ZATCA</div>
              <div className="text-2xl font-bold text-green-600">
                {invoices?.filter(i => i.is_zatca_compliant).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">مقبول</div>
              <div className="text-2xl font-bold text-blue-600">
                {invoices?.filter(i => i.zatca_status === 'accepted').length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-muted-foreground">معلق</div>
              <div className="text-2xl font-bold text-yellow-600">
                {invoices?.filter(i => i.zatca_status === 'pending' || !i.zatca_status).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
