import { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Receipt, Clock, CheckCircle, Mail, RefreshCw } from "lucide-react";
import { useCashierStats, useCashierDashboardRealtime, useCashierDashboardRefresh } from "@/hooks/dashboard";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { AddReceiptDialog } from "@/components/payments/AddReceiptDialog";
import { AddVoucherDialog } from "@/components/payments/AddVoucherDialog";
import { UnifiedDashboardLayout } from "@/components/dashboard/UnifiedDashboardLayout";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedStatsGrid } from "@/components/unified/UnifiedStatsGrid";
import { SectionSkeleton } from "@/components/dashboard";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";
import { LastSyncIndicator } from "@/components/nazer/LastSyncIndicator";
import { FinancialCardsRow } from "@/components/dashboard/shared";

// Lazy load heavy components
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));

export default function CashierDashboard() {
  const { data: stats, isLoading } = useCashierStats();
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // تفعيل التحديثات المباشرة الموحدة
  useCashierDashboardRealtime();
  const { refreshAll } = useCashierDashboardRefresh();

  if (isLoading) {
    return <LoadingState message="جاري تحميل بيانات أمين الصندوق..." />;
  }

  return (
    <UnifiedDashboardLayout
      role="cashier"
      actions={
        <div className="flex items-center gap-2">
          <LastSyncIndicator onRefresh={refreshAll} />
          <Button onClick={refreshAll} variant="ghost" size="icon" title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setMessageDialogOpen(true)} className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">إرسال رسالة</span>
          </Button>
        </div>
      }
    >
      {/* KPI Cards */}
      <UnifiedStatsGrid columns={4}>
        <UnifiedKPICard
          title="رصيد الصندوق"
          value={`${stats?.cashBalance.toLocaleString('ar-SA')} ريال`}
          icon={DollarSign}
          variant="default"
          subtitle="الرصيد الحالي"
        />
        <UnifiedKPICard
          title="مقبوضات اليوم"
          value={`${stats?.todayReceipts.toLocaleString('ar-SA')} ريال`}
          icon={TrendingUp}
          variant="success"
          subtitle="إجمالي المقبوضات"
        />
        <UnifiedKPICard
          title="مدفوعات اليوم"
          value={`${stats?.todayPayments.toLocaleString('ar-SA')} ريال`}
          icon={TrendingDown}
          variant="danger"
          subtitle="إجمالي المدفوعات"
        />
        <UnifiedKPICard
          title="معاملات معلقة"
          value={stats?.pendingTransactions || 0}
          icon={Clock}
          variant="warning"
          subtitle="في انتظار المعالجة"
        />
      </UnifiedStatsGrid>

      {/* بطاقات الرصيد البنكي ورقبة الوقف ونقطة البيع */}
      <FinancialCardsRow className="mt-6 mb-4" />

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="actions"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">إجراءات سريعة</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recent"
              className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">العمليات الأخيرة</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  ملخص اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">إجمالي المقبوضات</span>
                    <span className="text-lg font-bold text-success">
                      +{stats?.todayReceipts.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">إجمالي المدفوعات</span>
                    <span className="text-lg font-bold text-destructive">
                      -{stats?.todayPayments.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">الصافي</span>
                      <span className={`text-xl font-bold ${
                        (stats?.todayReceipts || 0) - (stats?.todayPayments || 0) >= 0 
                          ? 'text-success' 
                          : 'text-destructive'
                      }`}>
                        {((stats?.todayReceipts || 0) - (stats?.todayPayments || 0)).toLocaleString('ar-SA')} ريال
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setIsReceiptDialogOpen(true)}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-success" />
                    إضافة سند قبض
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    تسجيل مقبوضات نقدية أو بنكية جديدة
                  </p>
                  <Button className="w-full mt-4" variant="default">
                    <TrendingUp className="h-4 w-4 ml-2" />
                    سند قبض جديد
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setIsVoucherDialogOpen(true)}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                    إضافة سند صرف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    تسجيل مدفوعات نقدية أو بنكية جديدة
                  </p>
                  <Button className="w-full mt-4" variant="destructive">
                    <TrendingDown className="h-4 w-4 ml-2" />
                    سند صرف جديد
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Recent Entries Tab */}
          <TabsContent value="recent" className="space-y-4">
            <Suspense fallback={<SectionSkeleton />}>
              <RecentJournalEntries />
            </Suspense>
          </TabsContent>
        </Tabs>

      {/* Dialogs */}
      <AddReceiptDialog 
        open={isReceiptDialogOpen} 
        onOpenChange={setIsReceiptDialogOpen} 
      />
      <AddVoucherDialog 
        open={isVoucherDialogOpen} 
        onOpenChange={setIsVoucherDialogOpen} 
      />
      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </UnifiedDashboardLayout>
  );
}
