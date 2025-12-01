import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Inbox } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useBeneficiaryLoans } from "@/hooks/useBeneficiaryLoans";
import { useBeneficiaryEmergencyAid } from "@/hooks/useBeneficiaryEmergencyAid";
import { Skeleton } from "@/components/ui/skeleton";

export function LoansOverviewTab() {
  const { settings } = useVisibilitySettings();
  const { loans, statistics, isLoading: loansLoading, hasLoans } = useBeneficiaryLoans();
  const { emergencyAids, totalAidAmount, isLoading: aidsLoading, hasEmergencyAid } = useBeneficiaryEmergencyAid();

  if (!settings?.show_own_loans) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات القروض
        </CardContent>
      </Card>
    );
  }

  if (loansLoading || aidsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            قروضي الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasLoans ? (
            loans.map((loan) => {
              const percentage = loan.principal_amount 
                ? Math.round((loan.paid_amount / loan.principal_amount) * 100)
                : 0;
              const remaining = (loan.principal_amount || 0) - (loan.paid_amount || 0);
              const statusLabel = loan.status === "active" ? "نشط" : loan.status === "paid" ? "مسدد" : "غير محدد";
              
              return (
              <div key={loan.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">مبلغ القرض</p>
                    <p className="text-2xl font-bold">
                      <MaskedValue
                        value={(loan.principal_amount || 0).toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> ريال
                    </p>
                  </div>
                  <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                    {loan.status === "active" ? (
                      <AlertCircle className="h-4 w-4 ml-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 ml-1" />
                    )}
                    {statusLabel}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">المدفوع</p>
                    <p className="font-medium text-success">
                      <MaskedValue
                        value={(loan.paid_amount || 0).toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> ريال
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">المتبقي</p>
                    <p className="font-medium text-destructive">
                      <MaskedValue
                        value={remaining.toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> ريال
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">نسبة السداد</span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage} />
                </div>

                {loan.start_date && loan.due_date && (
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">تاريخ البداية: </span>
                      {format(new Date(loan.start_date), "dd/MM/yyyy", { locale: ar })}
                    </div>
                    <div>
                      <span className="font-medium">تاريخ الاستحقاق: </span>
                      {format(new Date(loan.due_date), "dd/MM/yyyy", { locale: ar })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
          ) : (
            <div className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد قروض نشطة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {settings?.show_other_loans && (
        <Card>
          <CardContent className="p-12 text-center">
            <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد بيانات قروض أخرى</p>
          </CardContent>
        </Card>
      )}

      {settings?.show_emergency_aid && (
        hasEmergencyAid ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                الفزعات الطارئة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {emergencyAids.map((aid) => (
                <div key={aid.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{aid.reason}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(aid.requested_date), "dd MMMM yyyy", { locale: ar })}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold">
                      <MaskedValue
                        value={(aid.amount || 0).toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> ريال
                    </p>
                    <Badge className="bg-success mt-1">{aid.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد فزعات طارئة</p>
            </CardContent>
          </Card>
        )
      )}

      {settings?.show_emergency_statistics && (hasLoans || hasEmergencyAid) && (
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات عامة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">إجمالي القروض</p>
                <p className="text-2xl font-bold">{statistics.totalLoans}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">القروض النشطة</p>
                <p className="text-2xl font-bold text-primary">{statistics.activeLoans}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">مجموع المبالغ</p>
                <p className="text-xl font-bold">
                  <MaskedValue
                    value={statistics.totalAmount.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_loan_amounts || false}
                  /> ريال
                </p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">الفزعات</p>
                <p className="text-xl font-bold text-success">
                  <MaskedValue
                    value={totalAidAmount.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_loan_amounts || false}
                  /> ريال
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
