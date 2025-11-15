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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <Wallet className="h-10 w-10 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">
                لوحة تحكم أمين الصندوق
              </h1>
              <p className="text-muted-foreground">
                إدارة المدفوعات والمقبوضات اليومية
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">رصيد الصندوق</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.cashBalance.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-xs text-muted-foreground mt-1">الرصيد الحالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">مقبوضات اليوم</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.todayReceipts.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المقبوضات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">مدفوعات اليوم</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats?.todayPayments.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-xs text-muted-foreground mt-1">إجمالي المدفوعات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">معاملات معلقة</CardTitle>
              <Receipt className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.pendingTransactions || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">تحتاج للمعالجة</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Button className="h-24 flex flex-col gap-2" onClick={() => setIsReceiptDialogOpen(true)}>
                <Receipt className="h-6 w-6" />
                <span>سند قبض جديد</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setIsVoucherDialogOpen(true)}>
                <TrendingDown className="h-6 w-6" />
                <span>سند صرف جديد</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => window.open('/accounting?tab=ledger', '_blank')}>
                <DollarSign className="h-6 w-6" />
                <span>عرض كشف الصندوق</span>
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
