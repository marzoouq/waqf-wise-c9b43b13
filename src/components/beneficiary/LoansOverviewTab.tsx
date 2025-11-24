import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export function LoansOverviewTab() {
  const { settings } = useVisibilitySettings();

  if (!settings?.show_own_loans) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          غير مصرح بعرض معلومات القروض
        </CardContent>
      </Card>
    );
  }

  const loansData = {
    myLoans: [
      {
        id: "1",
        amount: 50000,
        paid: 30000,
        remaining: 20000,
        percentage: 60,
        startDate: new Date(2024, 0, 15),
        dueDate: new Date(2024, 11, 15),
        status: "نشط",
      },
      {
        id: "2",
        amount: 30000,
        paid: 30000,
        remaining: 0,
        percentage: 100,
        startDate: new Date(2023, 5, 1),
        dueDate: new Date(2024, 5, 1),
        status: "مسدد",
      },
    ],
    otherLoans: [
      { beneficiary: "أحمد محمد", amount: 40000, status: "نشط" },
      { beneficiary: "فاطمة علي", amount: 25000, status: "نشط" },
      { beneficiary: "عبدالله سالم", amount: 35000, status: "متأخر" },
    ],
    emergencyAid: [
      {
        id: "1",
        description: "فزعة علاج طارئ",
        amount: 15000,
        date: new Date(2024, 9, 10),
        status: "مصروف",
      },
      {
        id: "2",
        description: "فزعة إصلاح منزل",
        amount: 10000,
        date: new Date(2024, 7, 5),
        status: "مصروف",
      },
    ],
    statistics: {
      totalLoans: 8,
      activeLoans: 5,
      totalAmount: 320000,
      totalAid: 125000,
    },
  };

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
          {loansData.myLoans.map((loan) => (
            <div key={loan.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">مبلغ القرض</p>
                  <p className="text-2xl font-bold">
                    <MaskedValue
                      value={loan.amount.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_loan_amounts || false}
                    /> ريال
                  </p>
                </div>
                <Badge variant={loan.status === "نشط" ? "default" : "secondary"}>
                  {loan.status === "نشط" ? (
                    <AlertCircle className="h-4 w-4 ml-1" />
                  ) : (
                    <CheckCircle className="h-4 w-4 ml-1" />
                  )}
                  {loan.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">المدفوع</p>
                  <p className="font-medium text-success">
                    <MaskedValue
                      value={loan.paid.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_loan_amounts || false}
                    /> ريال
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">المتبقي</p>
                  <p className="font-medium text-destructive">
                    <MaskedValue
                      value={loan.remaining.toLocaleString("ar-SA")}
                      type="amount"
                      masked={settings?.mask_loan_amounts || false}
                    /> ريال
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">نسبة السداد</span>
                  <span className="text-sm font-medium">{loan.percentage}%</span>
                </div>
                <Progress value={loan.percentage} />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">تاريخ البداية: </span>
                  {format(loan.startDate, "dd/MM/yyyy", { locale: ar })}
                </div>
                <div>
                  <span className="font-medium">تاريخ الاستحقاق: </span>
                  {format(loan.dueDate, "dd/MM/yyyy", { locale: ar })}
                </div>
              </div>
            </div>
          ))}
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
            {loansData.otherLoans.map((loan, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">
                    {settings?.show_other_beneficiaries_names ? loan.beneficiary : "مستفيد آخر"}
                  </h4>
                  {!settings?.mask_loan_amounts && (
                    <p className="text-sm text-muted-foreground">
                      {loan.amount.toLocaleString("ar-SA")} ريال
                    </p>
                  )}
                </div>
                <Badge variant={loan.status === "متأخر" ? "destructive" : "default"}>
                  {loan.status}
                </Badge>
              </div>
            ))}
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
            {loansData.emergencyAid.map((aid) => (
              <div key={aid.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{aid.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(aid.date, "dd MMMM yyyy", { locale: ar })}
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-bold">
                    <MaskedValue
                      value={aid.amount.toLocaleString("ar-SA")}
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
                <p className="text-2xl font-bold">{loansData.statistics.totalLoans}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">القروض النشطة</p>
                <p className="text-2xl font-bold text-primary">{loansData.statistics.activeLoans}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">مجموع المبالغ</p>
                <p className="text-xl font-bold">
                  <MaskedValue
                    value={loansData.statistics.totalAmount.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_loan_amounts || false}
                  /> ريال
                </p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">الفزعات</p>
                <p className="text-xl font-bold text-success">
                  <MaskedValue
                    value={loansData.statistics.totalAid.toLocaleString("ar-SA")}
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
