import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DollarSign, AlertCircle, CheckCircle, Inbox, Plus, Wallet, HandHeart } from "lucide-react";
import { useVisibilitySettings } from "@/hooks/governance/useVisibilitySettings";
import { MaskedValue } from "@/components/shared/MaskedValue";
import { format, arLocale as ar } from "@/lib/date";
import { useBeneficiaryLoans, useBeneficiaryEmergencyAid, useBeneficiaryId } from "@/hooks/beneficiary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmergencyRequestForm } from "@/components/beneficiary/EmergencyRequestForm";
import { LoanRequestForm } from "@/components/beneficiary/LoanRequestForm";
import { LoansService, RequestService } from "@/services";
import { matchesStatus } from "@/lib/constants";
import { useToast } from "@/hooks/ui/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  // جلب أنواع الطلبات ديناميكياً
  const { data: requestTypes = [] } = useQuery({
    queryKey: ['request-types-for-loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('request_types')
        .select('id, name_ar')
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
  });

  // إيجاد ID نوع القرض والفزعة ديناميكياً
  const loanTypeId = useMemo(() => 
    requestTypes.find(t => t.name_ar === 'قرض')?.id || null
  , [requestTypes]);
  
  const emergencyTypeId = useMemo(() => 
    requestTypes.find(t => t.name_ar === 'فزعة طارئة')?.id || null
  , [requestTypes]);

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

    if (!loanTypeId) {
      toast({ title: "خطأ", description: "لم يتم العثور على نوع طلب القرض", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const result = await RequestService.create({
        beneficiary_id: beneficiaryId,
        request_type_id: loanTypeId, // استخدام ID ديناميكي
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
    <div className="space-y-4">
      {/* أزرار تقديم الطلبات - ديسكتوب */}
      <div className="hidden sm:flex flex-wrap gap-3">
        <Button onClick={() => setShowEmergencyDialog(true)} variant="destructive" size="lg">
          <HandHeart className="h-4 w-4 ms-2" />
          طلب فزعة طارئة
        </Button>
        <Button onClick={() => setShowLoanDialog(true)} variant="default" size="lg">
          <Wallet className="h-4 w-4 ms-2" />
          طلب قرض
        </Button>
      </div>

      {/* أزرار تقديم الطلبات - جوال */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        <Button 
          onClick={() => setShowEmergencyDialog(true)} 
          variant="destructive" 
          className="h-auto py-3 flex-col gap-1"
        >
          <HandHeart className="h-5 w-5" />
          <span className="text-xs">فزعة طارئة</span>
        </Button>
        <Button 
          onClick={() => setShowLoanDialog(true)} 
          variant="default"
          className="h-auto py-3 flex-col gap-1"
        >
          <Wallet className="h-5 w-5" />
          <span className="text-xs">طلب قرض</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            قروضي الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasLoans ? (
            loans.map((loan) => {
              const percentage = loan.principal_amount 
                ? Math.round((loan.paid_amount / loan.principal_amount) * 100)
                : 0;
              const remaining = (loan.principal_amount || 0) - (loan.paid_amount || 0);
              const isActive = matchesStatus(loan.status, 'active');
              const isPaid = matchesStatus(loan.status, 'paid');
              const statusLabel = isActive ? "نشط" : isPaid ? "مسدد" : "غير محدد";
              
              return (
              <div key={loan.id} className="space-y-3 p-3 sm:p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">مبلغ القرض</p>
                    <p className="text-lg sm:text-2xl font-bold">
                      <MaskedValue
                        value={(loan.principal_amount || 0).toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> <span className="text-sm">ريال</span>
                    </p>
                  </div>
                  <Badge variant={isActive ? "default" : "secondary"} className="gap-1">
                    {isActive ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <CheckCircle className="h-3 w-3" />
                    )}
                    {statusLabel}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="p-2 bg-success/10 rounded">
                    <p className="text-muted-foreground">المدفوع</p>
                    <p className="font-medium text-success">
                      <MaskedValue
                        value={(loan.paid_amount || 0).toLocaleString("ar-SA")}
                        type="amount"
                        masked={settings?.mask_loan_amounts || false}
                      /> ريال
                    </p>
                  </div>
                  <div className="p-2 bg-destructive/10 rounded">
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
                  <div className="flex justify-between mb-1 text-xs sm:text-sm">
                    <span>نسبة السداد</span>
                    <span className="font-medium">{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>

                {loan.start_date && loan.due_date && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t">
                    <span>البداية: {format(new Date(loan.start_date), "dd/MM/yyyy", { locale: ar })}</span>
                    <span>الاستحقاق: {format(new Date(loan.due_date), "dd/MM/yyyy", { locale: ar })}</span>
                  </div>
                )}
              </div>
            );
          })
          ) : (
            <div className="p-8 text-center">
              <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground text-sm">لا توجد قروض نشطة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {settings?.show_emergency_aid && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HandHeart className="h-5 w-5" />
              الفزعات الطارئة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasEmergencyAid ? (
              <div className="space-y-3">
                {emergencyAids.map((aid) => (
                  <div key={aid.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">{aid.reason}</h4>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(aid.requested_date), "dd/MM/yyyy", { locale: ar })}
                      </p>
                    </div>
                    <div className="text-left shrink-0 ms-3">
                      <p className="font-bold text-sm">
                        <MaskedValue
                          value={(aid.amount || 0).toLocaleString("ar-SA")}
                          type="amount"
                          masked={settings?.mask_loan_amounts || false}
                        /> ر.س
                      </p>
                      <Badge variant="outline" className="text-xs mt-1 text-success border-success/30">
                        {aid.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Inbox className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground text-sm">لا توجد فزعات طارئة</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {settings?.show_emergency_statistics && (hasLoans || hasEmergencyAid) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">إحصائيات عامة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">إجمالي القروض</p>
                <p className="text-xl font-bold">{statistics.totalLoans}</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">القروض النشطة</p>
                <p className="text-xl font-bold text-primary">{statistics.activeLoans}</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">مجموع المبالغ</p>
                <p className="text-sm font-bold">
                  <MaskedValue
                    value={statistics.totalAmount.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_loan_amounts || false}
                  /> ر.س
                </p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">الفزعات</p>
                <p className="text-sm font-bold text-success">
                  <MaskedValue
                    value={totalAidAmount.toLocaleString("ar-SA")}
                    type="amount"
                    masked={settings?.mask_loan_amounts || false}
                  /> ر.س
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* زر عائم للجوال */}
      <div className="fixed bottom-20 left-4 z-50 sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => setShowLoanDialog(true)}>
              <Wallet className="h-4 w-4 ms-2" />
              طلب قرض
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowEmergencyDialog(true)} className="text-destructive">
              <HandHeart className="h-4 w-4 ms-2" />
              فزعة طارئة
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Dialog طلب الفزعة */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HandHeart className="h-5 w-5 text-destructive" />
              طلب فزعة طارئة
            </DialogTitle>
            <DialogDescription>
              قدم طلب مساعدة طارئة في حالات الضرورة
            </DialogDescription>
          </DialogHeader>
          <EmergencyRequestForm onSubmit={handleEmergencySubmit} isLoading={isSubmitting} />
        </DialogContent>
      </Dialog>

      {/* Dialog طلب القرض */}
      <Dialog open={showLoanDialog} onOpenChange={setShowLoanDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              طلب قرض
            </DialogTitle>
            <DialogDescription>
              قدم طلب للحصول على قرض من الوقف
            </DialogDescription>
          </DialogHeader>
          <LoanRequestForm onSubmit={handleLoanSubmit} isLoading={isSubmitting} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
