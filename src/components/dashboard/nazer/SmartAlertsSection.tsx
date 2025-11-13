import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  FileWarning,
  Home,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { ar } from "date-fns/locale";

interface Alert {
  id: string;
  type: 'contract_expiring' | 'rent_overdue' | 'loan_due' | 'request_overdue';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  actionUrl: string;
}

export default function SmartAlertsSection() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('nazer-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, fetchAlerts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_payments' }, fetchAlerts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, fetchAlerts)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'beneficiary_requests' }, fetchAlerts)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching alerts...');
      const allAlerts: Alert[] = [];
      const today = new Date();

      // 1. عقود قرب الانتهاء
      const { data: expiringContracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*, properties(name)')
        .eq('status', 'نشط')
        .gte('end_date', format(today, 'yyyy-MM-dd'))
        .lte('end_date', format(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

      if (contractsError) {
        console.error('❌ Error fetching expiring contracts:', contractsError);
      }

    if (expiringContracts) {
      expiringContracts.forEach(contract => {
        const daysRemaining = differenceInDays(new Date(contract.end_date), today);
        allAlerts.push({
          id: contract.id,
          type: 'contract_expiring',
          title: `عقد ${contract.contract_number} قارب الانتهاء`,
          description: `عقد ${contract.tenant_name} - ${contract.properties?.name} ينتهي خلال ${daysRemaining} يوم`,
          severity: daysRemaining <= 30 ? 'high' : 'medium',
          date: new Date(contract.end_date),
          actionUrl: '/properties?tab=contracts'
        });
      });
    }

    // 2. إيجارات متأخرة
    const { data: overduePayments } = await supabase
      .from('rental_payments')
      .select('*, contracts(tenant_name, properties(name))')
      .eq('status', 'متأخر');

    if (overduePayments) {
      overduePayments.forEach(payment => {
        const daysOverdue = differenceInDays(today, new Date(payment.due_date));
        allAlerts.push({
          id: payment.id,
          type: 'rent_overdue',
          title: `دفعة إيجار متأخرة - ${payment.payment_number}`,
          description: `${payment.contracts?.tenant_name} - متأخر ${daysOverdue} يوم - ${payment.amount_due.toLocaleString('ar-SA')} ر.س`,
          severity: daysOverdue > 30 ? 'high' : 'medium',
          date: new Date(payment.due_date),
          actionUrl: '/properties?tab=payments'
        });
      });
    }

    // 3. قروض مستحقة
    const { data: dueInstallments } = await supabase
      .from('loan_installments')
      .select('*, loans(loan_number, beneficiaries(full_name))')
      .in('status', ['pending', 'overdue'])
      .lte('due_date', format(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));

    if (dueInstallments) {
      dueInstallments.forEach(installment => {
        const daysUntilDue = differenceInDays(new Date(installment.due_date), today);
        allAlerts.push({
          id: installment.id,
          type: 'loan_due',
          title: `قسط قرض ${installment.loans?.loan_number || ''} مستحق`,
          description: `${installment.loans?.beneficiaries?.full_name || ''} - قسط رقم ${installment.installment_number} - ${installment.total_amount.toLocaleString('ar-SA')} ر.س`,
          severity: daysUntilDue < 0 ? 'high' : 'medium',
          date: new Date(installment.due_date),
          actionUrl: '/loans'
        });
      });
    }

    // 4. طلبات متأخرة عن SLA
    const { data: overdueRequests } = await supabase
      .from('beneficiary_requests')
      .select('*, beneficiaries(full_name)')
      .eq('is_overdue', true)
      .in('status', ['قيد المراجعة', 'قيد المعالجة']);

    if (overdueRequests) {
      overdueRequests.forEach(request => {
        allAlerts.push({
          id: request.id,
          type: 'request_overdue',
          title: `طلب ${request.request_number || ''} متأخر`,
          description: `${request.beneficiaries?.full_name || ''} - تجاوز SLA المحدد`,
          severity: 'high',
          date: new Date(request.sla_due_at),
          actionUrl: '/requests'
        });
      });
    }

      // ترتيب حسب الخطورة والتاريخ
      allAlerts.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return a.date.getTime() - b.date.getTime();
      });

      console.log('✅ Alerts fetched:', allAlerts.length);
      setAlerts(allAlerts);
    } catch (error) {
      console.error('❌ Error in fetchAlerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive' as const;
      case 'medium': return 'default' as const;
      default: return 'secondary' as const;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'contract_expiring': return <Calendar className="h-5 w-5" />;
      case 'rent_overdue': return <DollarSign className="h-5 w-5" />;
      case 'loan_due': return <FileWarning className="h-5 w-5" />;
      case 'request_overdue': return <Clock className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 animate-pulse" />
            جاري تحميل التنبيهات...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-success bg-success/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-success">
            <Home className="h-5 w-5" />
            لا توجد تنبيهات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            جميع الأمور تسير بشكل طبيعي ✨
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          التنبيهات الذكية ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-4 p-4 bg-background rounded-lg border hover:border-primary transition-colors"
            >
              <div className="flex-shrink-0">
                {getAlertIcon(alert.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium truncate">{alert.title}</h4>
                  <Badge variant={getSeverityColor(alert.severity)}>
                    {alert.severity === 'high' ? 'عاجل' : alert.severity === 'medium' ? 'مهم' : 'عادي'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {alert.description}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(alert.actionUrl)}
              >
                معالجة
              </Button>
            </div>
          ))}
        </div>

        {alerts.length > 5 && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            وهناك {alerts.length - 5} تنبيه آخر
          </p>
        )}
      </CardContent>
    </Card>
  );
}
