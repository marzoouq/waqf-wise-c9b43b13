import { lazy, Suspense, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Receipt, Clock, CheckCircle } from "lucide-react";
import { useCashierStats } from "@/hooks/useCashierStats";
import { LoadingState } from "@/components/shared/LoadingState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AddReceiptDialog } from "@/components/payments/AddReceiptDialog";
import { AddVoucherDialog } from "@/components/payments/AddVoucherDialog";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

// Lazy load heavy components
const RecentJournalEntries = lazy(() => import("@/components/dashboard/RecentJournalEntries"));

export default function CashierDashboard() {
  const { data: stats, isLoading } = useCashierStats();
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [isVoucherDialogOpen, setIsVoucherDialogOpen] = useState(false);

  if (isLoading) {
    return <LoadingState message="جاري تحميل بيانات أمين الصندوق..." />;
  }

  return (
    <PageErrorBoundary pageName="لوحة تحكم أمين الصندوق">
      <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="لوحة تحكم أمين الصندوق"
        description="إدارة المدفوعات والمقبوضات اليومية"
        icon={<Wallet className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-orange-600" />}
      />

        {/* KPI Cards */}
        <div className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">رصيد الصندوق</CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                {stats?.cashBalance.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">الرصيد الحالي</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">مقبوضات اليوم</CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                +{stats?.todayReceipts.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">إجمالي المقبوضات</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">مدفوعات اليوم</CardTitle>
              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
                -{stats?.todayPayments.toLocaleString('ar-SA')} ريال
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">إجمالي المدفوعات</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">معاملات معلقة</CardTitle>
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
                {stats?.pendingTransactions || 0}
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">في انتظار المعالجة</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">إجراءات سريعة</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="gap-2">
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
                    <span className="text-lg font-bold text-green-600">
                      +{stats?.todayReceipts.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">إجمالي المدفوعات</span>
                    <span className="text-lg font-bold text-red-600">
                      -{stats?.todayPayments.toLocaleString('ar-SA')} ريال
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">الصافي</span>
                      <span className={`text-xl font-bold ${
                        (stats?.todayReceipts || 0) - (stats?.todayPayments || 0) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
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
                    <TrendingUp className="h-5 w-5 text-green-600" />
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
                    <TrendingDown className="h-5 w-5 text-red-600" />
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
            <Suspense fallback={
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            }>
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
    </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
