import { useState, useEffect } from 'react';
import { productionLogger } from '@/lib/logger/production-logger';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TransferStatus {
  id: string;
  beneficiary_name: string;
  iban: string;
  amount: number;
  status: string;
  reference_number?: string | null;
  error_message?: string | null;
  processed_at?: string | null;
}

interface TransferStatusTrackerProps {
  transferFileId: string;
}

export function TransferStatusTracker({ transferFileId }: TransferStatusTrackerProps) {
  const [transfers, setTransfers] = useState<TransferStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadTransfers();
    
    if (autoRefresh) {
      const interval = setInterval(loadTransfers, 10000); // كل 10 ثواني
      return () => clearInterval(interval);
    }
  }, [transferFileId, autoRefresh]);

  const loadTransfers = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_transfer_details')
        .select('id, beneficiary_name, iban, amount, status, reference_number, error_message, processed_at')
        .eq('transfer_file_id', transferFileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransfers(data || []);
    } catch (error) {
      productionLogger.error('Error loading transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: transfers.length,
    completed: transfers.filter(t => t.status === 'completed').length,
    processing: transfers.filter(t => t.status === 'processing').length,
    failed: transfers.filter(t => t.status === 'failed').length,
    pending: transfers.filter(t => t.status === 'pending').length,
    totalAmount: transfers.reduce((sum, t) => sum + t.amount, 0),
    completedAmount: transfers
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0),
  };

  const progress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  const statusConfig: Record<string, {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }> = {
    completed: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      label: 'مكتمل',
      variant: 'default',
    },
    processing: {
      icon: Clock,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      label: 'جاري المعالجة',
      variant: 'secondary',
    },
    pending: {
      icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10',
      label: 'معلق',
      variant: 'outline',
    },
    failed: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      label: 'فشل',
      variant: 'destructive',
    },
  };

  const exportReport = () => {
    const csv = [
      ['الاسم', 'IBAN', 'المبلغ', 'الحالة', 'رقم المرجع', 'تاريخ المعالجة', 'سبب الفشل'],
      ...transfers.map(t => [
        t.beneficiary_name,
        t.iban,
        t.amount,
        statusConfig[t.status].label,
        t.reference_number || '-',
        t.processed_at || '-',
        t.error_message || '-',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transfer_status_${transferFileId}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">جاري التحميل...</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">إجمالي التحويلات</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">مكتملة</div>
          <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">فاشلة</div>
          <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground mb-1">قيد المعالجة</div>
          <div className="text-2xl font-bold text-blue-500">
            {stats.processing + stats.pending}
          </div>
        </Card>
      </div>

      {/* Progress */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">تقدم المعالجة</h3>
              <p className="text-sm text-muted-foreground">
                {stats.completed} من {stats.total} تحويل
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <RefreshCw className={`h-4 w-4 ml-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'إيقاف التحديث' : 'تحديث تلقائي'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4 ml-2" />
                تصدير التقرير
              </Button>
            </div>
          </div>
          <Progress value={progress} />
          <div className="text-sm text-center text-muted-foreground">
            {progress.toFixed(1)}% مكتمل
          </div>
        </div>
      </Card>

      {/* Transfers List */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">تفاصيل التحويلات</h3>
        <div className="space-y-2">
          {transfers.map(transfer => {
            const config = statusConfig[transfer.status] || statusConfig.pending;
            const Icon = config.icon;

            return (
              <div
                key={transfer.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 border"
              >
                <div className={`${config.bgColor} p-2 rounded-full`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{transfer.beneficiary_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {transfer.iban} • {transfer.amount.toLocaleString('ar-SA')} ريال
                  </div>
                  {transfer.reference_number && (
                    <div className="text-xs text-muted-foreground">
                      رقم المرجع: {transfer.reference_number}
                    </div>
                  )}
                  {transfer.error_message && (
                    <div className="text-xs text-red-500 mt-1">{transfer.error_message}</div>
                  )}
                </div>
                <Badge variant={config.variant}>{config.label}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-muted/50">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground mb-1">إجمالي المبلغ</div>
            <div className="text-xl font-bold">
              {stats.totalAmount.toLocaleString('ar-SA')} ريال
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">المبلغ المحول</div>
            <div className="text-xl font-bold text-green-500">
              {stats.completedAmount.toLocaleString('ar-SA')} ريال
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
