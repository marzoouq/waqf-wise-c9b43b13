import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useLoans } from "@/hooks/useLoans";
import { useEmergencyAid } from "@/hooks/useEmergencyAid";
import { useAuth } from "@/hooks/useAuth";

export function LoansOverviewTab() {
  const { settings } = useVisibilitySettings();
  const { user } = useAuth();
  const { loans, isLoading: loansLoading } = useLoans();
  const { emergencyAids, isLoading: aidsLoading } = useEmergencyAid();

  if (!settings?.show_own_loans) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات القروض
        </CardContent>
      </Card>
    );
  }

  // جلب القروض الخاصة بالمستفيد الحالي
  const myLoans = loans.filter(loan => loan.beneficiary_id === user?.id);
  const otherLoans = loans.filter(loan => loan.beneficiary_id !== user?.id);
  
  // جلب الفزعات الخاصة بالمستفيد الحالي
  const myEmergencyAids = emergencyAids.filter(aid => aid.beneficiary_id === user?.id);
  
  // حساب الإحصائيات
  const statistics = {
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status === 'active').length,
    totalAmount: loans.reduce((sum, l) => sum + (l.principal_amount || 0), 0),
    totalAid: emergencyAids.reduce((sum, a) => sum + (a.amount || 0), 0),
  };
  
  if (loansLoading || aidsLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          جاري تحميل البيانات...
        </CardContent>
      </Card>
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
          {myLoans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد قروض نشطة حالياً
            </div>
          ) : (
            myLoans.map((loan) => {
              const paid = loan.paid_amount || 0;
              const remaining = (loan.principal_amount || 0) - paid;
              const percentage = loan.principal_amount ? Math.round((paid / loan.principal_amount) * 100) : 0;
              
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
                    <Badge variant={loan.status === 'active' ? "default" : "secondary"}>
                      {loan.status === 'active' ? (
                        <AlertCircle className="h-4 w-4 ml-1" />
                      ) : (
                        <CheckCircle className="h-4 w-4 ml-1" />
                      )}
                      {loan.status === 'active' ? 'نشط' : loan.status === 'paid' ? 'مسدد' : loan.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">المدفوع</p>
                      <p className="font-medium text-success">
                        <MaskedValue
                          value={paid.toLocaleString("ar-SA")}
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

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">تاريخ البداية: </span>
                      {loan.start_date ? format(new Date(loan.start_date), "dd/MM/yyyy", { locale: ar }) : '-'}
                    </div>
                    <div>
                      <span className="font-medium">تاريخ الاستحقاق: </span>
                      {loan.end_date ? format(new Date(loan.end_date), "dd/MM/yyyy", { locale: ar }) : '-'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {settings?.show_other_loans && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              قروض المستفيدين الآخرين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherLoans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد قروض لمستفيدين آخرين
              </div>
            ) : (
              otherLoans.map((loan) => (
                <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      {settings?.show_other_beneficiaries_names && loan.beneficiaries 
                        ? loan.beneficiaries.full_name 
                        : "مستفيد آخر"}
                    </h4>
                    {!settings?.mask_loan_amounts && (
                      <p className="text-sm text-muted-foreground">
                        {(loan.principal_amount || 0).toLocaleString("ar-SA")} ريال
                      </p>
                    )}
                  </div>
                  <Badge variant={loan.status === "overdue" ? "destructive" : "default"}>
                    {loan.status === 'active' ? 'نشط' : loan.status === 'overdue' ? 'متأخر' : loan.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {settings?.show_emergency_aid && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              الفزعات الطارئة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {myEmergencyAids.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                لا توجد فزعات طارئة
              </div>
            ) : (
              myEmergencyAids.map((aid) => (
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
                    <Badge className="bg-success mt-1">
                      {aid.status === 'disbursed' ? 'مصروف' : aid.status === 'approved' ? 'معتمد' : aid.status === 'pending' ? 'قيد المراجعة' : aid.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {settings?.show_emergency_statistics && (
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
                    value={statistics.totalAid.toLocaleString("ar-SA")}
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
