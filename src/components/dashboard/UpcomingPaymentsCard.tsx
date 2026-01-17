import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CreditCard, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@/components/shared/ErrorState";
import { useTenants } from "@/hooks/property/useTenants";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";

interface UpcomingPayment {
  id: string;
  tenantName: string;
  tenantPhone: string;
  amount: number;
  daysRemaining: number;
  isOverdue: boolean;
}

export const UpcomingPaymentsCard = () => {
  const { tenants, isLoading, error, refetch } = useTenants();
  const navigate = useNavigate();
  const today = new Date();

  if (error) {
    return <ErrorState title="خطأ في تحميل بيانات الدفعات" message={(error as Error).message} onRetry={refetch} />;
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            الدفعات المستحقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            جاري التحميل...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(tenants)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            الدفعات المستحقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            لا توجد بيانات
          </div>
        </CardContent>
      </Card>
    );
  }

  // حساب الدفعات المستحقة من المستأجرين (الذين لديهم رصيد مستحق موجب)
  const upcomingPayments: UpcomingPayment[] = tenants
    .filter((tenant) => {
      // فقط المستأجرين النشطين الذين لديهم رصيد مستحق
      if (tenant.status !== 'نشط') return false;
      // current_balance موجب = المستأجر مدين
      return tenant.current_balance > 0;
    })
    .map((tenant) => {
      const balance = tenant.current_balance;
      
      // نفترض أن الدفعة مستحقة بناءً على الرصيد
      // إذا كان هناك رصيد فهو مستحق الآن
      const daysRemaining = balance > 0 ? 0 : 30;
      
      return {
        id: tenant.id,
        tenantName: tenant.full_name || 'غير معروف',
        tenantPhone: tenant.phone || '',
        amount: balance,
        daysRemaining,
        isOverdue: balance > 0,
      };
    })
    .sort((a, b) => {
      // الأولوية للمبالغ الأكبر
      return b.amount - a.amount;
    })
    .slice(0, 6); // أول 6 دفعات

  const overdueCount = upcomingPayments.filter(p => p.isOverdue).length;

  const getSeverityBadge = (payment: UpcomingPayment) => {
    if (payment.amount > 10000) {
      return { 
        variant: "destructive" as const, 
        label: "مبلغ كبير",
        color: "bg-destructive/10 text-destructive border-destructive/20" 
      };
    }
    if (payment.amount > 5000) {
      return { 
        variant: "secondary" as const, 
        label: "مستحق",
        color: "bg-warning/10 text-warning border-warning/20" 
      };
    }
    return { 
      variant: "outline" as const, 
      label: "مستحق",
      color: "bg-info/10 text-info border-info/20" 
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (upcomingPayments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4" />
            الدفعات المستحقة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
              <CreditCard className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              لا توجد دفعات مستحقة حالياً
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={overdueCount > 0 ? "border-warning" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CreditCard className={`h-4 w-4 ${overdueCount > 0 ? 'text-warning' : ''}`} />
            الدفعات المستحقة
          </div>
          {overdueCount > 0 && (
            <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning border-warning/20">
              <AlertTriangle className="h-3 w-3" />
              {overdueCount} مستحق
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingPayments.map((payment) => {
            const severity = getSeverityBadge(payment);

            return (
              <div 
                key={payment.id} 
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate">
                      {payment.tenantName}
                    </span>
                    <Badge 
                      variant={severity.variant}
                      className={`text-xs ${severity.color}`}
                    >
                      {severity.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 flex-shrink-0">
                  {payment.tenantPhone && (
                    <WhatsAppButton
                      phone={payment.tenantPhone}
                      tenantName={payment.tenantName}
                      amount={payment.amount}
                      daysRemaining={payment.daysRemaining}
                      variant="ghost"
                      size="sm"
                    />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/tenants/${payment.id}`)}
                    className="gap-1"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/tenants')}
          >
            عرض جميع المستأجرين
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
