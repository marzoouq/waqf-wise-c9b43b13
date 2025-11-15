import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Receipt } from "lucide-react";
import { useCashierStats } from "@/hooks/useCashierStats";
import { LoadingState } from "@/components/shared/LoadingState";
import { AddReceiptDialog } from "@/components/payments/AddReceiptDialog";
import { AddVoucherDialog } from "@/components/payments/AddVoucherDialog";

export default function CashierDashboard() {
  const { data: stats, isLoading } = useCashierStats();
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);

  if (isLoading) {
    return <LoadingState message="جاري تحميل بيانات أمين الصندوق..." />;
  }

  return (
    <div className="min-h-screen bg-background px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="container mx-auto max-w-7xl space-y-4 sm:space-y-5 md:space-y-6">
        <header className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Wallet className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-orange-600" />
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
                لوحة تحكم أمين الصندوق
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                إدارة المدفوعات والمقبوضات اليومية
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">رصيد الصندوق</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {stats?.cashBalance.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">الرصيد الحالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">مقبوضات اليوم</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                {stats?.todayReceipts.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">إجمالي المقبوضات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">مدفوعات اليوم</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                {stats?.todayPayments.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">إجمالي المدفوعات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">معاملات معلقة</CardTitle>
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">
                {stats?.pendingTransactions || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">تحتاج للمعالجة</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <Button
                size="lg"
                className="h-auto py-4 sm:py-6 flex-col gap-1.5 sm:gap-2"
                onClick={() => setIsReceiptDialogOpen(true)}
              >
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-xs sm:text-sm md:text-base">سند قبض جديد</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-4 sm:py-6 flex-col gap-1.5 sm:gap-2"
                onClick={() => setIsVoucherDialogOpen(true)}
              >
                <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-xs sm:text-sm md:text-base">سند صرف جديد</span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto py-4 sm:py-6 flex-col gap-1.5 sm:gap-2"
                onClick={() => window.open('/accounting?tab=ledger', '_blank')}
              >
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-xs sm:text-sm md:text-base">كشف الصندوق</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddReceiptDialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen} />
      <AddVoucherDialog open={isVoucherDialogOpen} onOpenChange={setIsVoucherDialogOpen} />
    </div>
  );
}
