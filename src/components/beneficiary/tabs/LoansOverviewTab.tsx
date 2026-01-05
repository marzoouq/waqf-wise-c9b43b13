import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, Inbox, Plus } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { format, arLocale as ar } from "@/lib/date";
import { useBeneficiaryLoans, useBeneficiaryEmergencyAid, useBeneficiaryId } from "@/hooks/beneficiary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmergencyRequestForm } from "@/components/beneficiary/EmergencyRequestForm";
import { LoanRequestForm } from "@/components/beneficiary/LoanRequestForm";
import { LoansService, RequestService } from "@/services";
import { useToast } from "@/hooks/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LoansOverviewTab() {
  const { settings } = useVisibilitySettings();
  const { loans, statistics, isLoading: loansLoading, hasLoans } = useBeneficiaryLoans();
  const { emergencyAids, totalAidAmount, isLoading: aidsLoading, hasEmergencyAid } = useBeneficiaryEmergencyAid();
  const { beneficiaryId } = useBeneficiaryId();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showLoanDialog, setShowLoanDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmergencySubmit = async (data: { amount: number; emergency_reason: string; description: string }) => {
    if (!beneficiaryId) {
      toast({ title: "خطأ", description: "لم يتم العثور على معرف المستفيد", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await LoansService.createEmergencyAid({
        beneficiary_id: beneficiaryId,
        amount: data.amount,
        reason: data.emergency_reason,
        aid_type: "فزعة طارئة",
        urgency_level: "high",
        notes: data.description,
      });
      
      toast({ title: "تم بنجاح", description: "تم تقديم طلب الفزعة الطارئة" });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EMERGENCY_AID });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_EMERGENCY_AID(beneficiaryId) });
      setShowEmergencyDialog(false);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تقديم طلب الفزعة", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoanSubmit = async (data: { loan_amount: number; loan_term_months: number; loan_reason: string; description: string }) => {
    if (!beneficiaryId) {
      toast({ title: "خطأ", description: "لم يتم العثور على معرف المستفيد", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // تقديم طلب القرض عبر نظام الطلبات (ليس مباشرة في جدول القروض)
      const result = await RequestService.create({
        beneficiary_id: beneficiaryId,
        request_type_id: "9822dc12-eef2-4cf7-92fa-113be89b1d6d", // نوع القرض من قاعدة البيانات
        description: `طلب قرض بقيمة ${data.loan_amount} ريال لمدة ${data.loan_term_months} شهر\nسبب القرض: ${data.loan_reason}\n${data.description}`,
        amount: data.loan_amount,
        priority: "متوسطة",
      });
      
      if (!result.success) throw new Error(result.message);
      
      toast({ title: "تم بنجاح", description: "تم تقديم طلب القرض وسيتم مراجعته" });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REQUESTS });
      setShowLoanDialog(false);
    } catch (error) {
      toast({ title: "خطأ", description: "فشل في تقديم طلب القرض", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      {/* أزرار تقديم الطلبات */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setShowEmergencyDialog(true)} variant="destructive">
          <Plus className="h-4 w-4 ms-2" />
          طلب فزعة طارئة
        </Button>
        <Button onClick={() => setShowLoanDialog(true)} variant="default">
          <Plus className="h-4 w-4 ms-2" />
          طلب قرض
        </Button>
      </div>

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
              const statusLabel = (loan.status === "نشط" || loan.status === "active") ? "نشط" : (loan.status === "مسدد" || loan.status === "paid") ? "مسدد" : "غير محدد";
              
              return (
              <div key={loan.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">مبلغ القرض</p>
                    <p className="text-xl sm:text-2xl font-bold">
                      <MaskedValue
                        value={(loan.principal_amount || 0).toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> ريال
                    </p>
                  </div>
                  <Badge variant={(loan.status === "نشط" || loan.status === "active") ? "default" : "secondary"}>
                    {(loan.status === "نشط" || loan.status === "active") ? (
                      <AlertCircle className="h-4 w-4 ms-1" />
                    ) : (
                      <CheckCircle className="h-4 w-4 ms-1" />
                    )}
                    {statusLabel}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">إجمالي القروض</p>
                <p className="text-xl sm:text-2xl font-bold">{statistics.totalLoans}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">القروض النشطة</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">{statistics.activeLoans}</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">مجموع المبالغ</p>
                <p className="text-base sm:text-xl font-bold">
                  <MaskedValue
                    value={statistics.totalAmount.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_loan_amounts || false}
                  /> ريال
                </p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">الفزعات</p>
                <p className="text-base sm:text-xl font-bold text-success">
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

      {/* Dialog طلب الفزعة */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>طلب فزعة طارئة</DialogTitle>
          </DialogHeader>
          <EmergencyRequestForm onSubmit={handleEmergencySubmit} isLoading={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Dialog طلب القرض */}
      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              طلب قرض
            </DialogTitle>
          </DialogHeader>
          <LoanRequestForm onSubmit={handleLoanSubmit} isLoading={isSubmitting} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
