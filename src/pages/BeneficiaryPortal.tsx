import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { AlertCircle } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary";
import { FiscalYearNotPublishedBanner } from "@/components/beneficiary/FiscalYearNotPublishedBanner";
import { PreviewModeBanner } from "@/components/beneficiary/PreviewModeBanner";
import { OverviewSection } from "@/components/beneficiary/sections/OverviewSection";
import { TabRenderer } from "@/components/beneficiary/TabRenderer";
import { useMemo, useCallback } from "react";
import { BeneficiarySidebar } from "@/components/beneficiary/BeneficiarySidebar";
import { BeneficiaryBottomNavigation } from "@/components/mobile/BeneficiaryBottomNavigation";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useBeneficiaryPortalData } from "@/hooks/beneficiary/useBeneficiaryPortalData";
import { useBeneficiarySession } from "@/hooks/beneficiary/useBeneficiarySession";
import { ErrorState } from "@/components/shared/ErrorState";
import { useBeneficiaryDashboardRealtime } from "@/hooks/dashboard/useBeneficiaryDashboardRealtime";
import { useQueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function BeneficiaryPortal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { settings } = useVisibilitySettings();

  // استخدام Hook المخصص لجلب البيانات (يتضمن التحقق من وضع المعاينة)
  const { beneficiary, statistics, isLoading, isPreviewMode, error, refetch } = useBeneficiaryPortalData();

  // تفعيل Realtime للتحديثات الفورية
  useBeneficiaryDashboardRealtime({
    enabled: !!beneficiary?.id && !isPreviewMode,
    beneficiaryId: beneficiary?.id,
  });

  // اسم المستفيد للعرض في بانر المعاينة
  const beneficiaryName = useMemo(() => {
    return beneficiary?.full_name;
  }, [beneficiary]);

  // تتبع جلسة المستفيد للناظر (فقط إذا لم يكن في وضع المعاينة)
  useBeneficiarySession({
    beneficiaryId: beneficiary?.id,
    enabled: !!beneficiary?.id && !isPreviewMode,
  });

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams);
  };

  const handleClosePreview = () => {
    navigate("/nazer-dashboard");
  };

  // إعادة جلب البيانات عند حدوث خطأ (استخدام React Query بدلاً من reload)
  const handleRetry = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['beneficiary'] });
    queryClient.invalidateQueries({ queryKey: ['preview-beneficiary'] });
    refetch?.();
  }, [queryClient, refetch]);

  if (isLoading) {
    return <LoadingState fullScreen />;
  }

  if (error) {
    return <ErrorState title="خطأ في تحميل البيانات" message="فشل تحميل بيانات المستفيد" onRetry={handleRetry} fullScreen />;
  }

  if (!beneficiary) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">خطأ في الوصول</h3>
            <p className="text-muted-foreground mb-4">لم يتم العثور على بيانات المستفيد</p>
            <Button onClick={() => navigate("/login")}>العودة لتسجيل الدخول</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageErrorBoundary pageName="بوابة المستفيد">
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full bg-background">
          {/* Sidebar - يتحول تلقائياً بين Sheet (جوال) و fixed (ديسكتوب) */}
          <BeneficiarySidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            beneficiaryName={beneficiary.full_name}
          />

          <SidebarInset>
            {/* Mobile Header - ثابت في الأعلى للجوال فقط */}
            <header className="sticky top-0 z-40 h-14 bg-background border-b flex items-center px-4 md:hidden">
              <SidebarTrigger className="h-9 w-9" />
              <h1 className="flex-1 text-center font-semibold text-sm">بوابة الوقف</h1>
              <div className="w-9" /> {/* Spacer للتوازن */}
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto overscroll-contain scroll-smooth touch-pan-y">
              <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-6 max-w-7xl mx-auto space-y-6">
                {/* بانر وضع المعاينة */}
                {isPreviewMode && (
                  <PreviewModeBanner 
                    beneficiaryName={beneficiaryName} 
                    onClose={handleClosePreview}
                  />
                )}

                {/* بانر حالة نشر السنة المالية */}
                <FiscalYearNotPublishedBanner />

                {/* Overview Tab */}
                {activeTab === "overview" && settings?.show_overview && (
                  <OverviewSection beneficiary={beneficiary as Beneficiary} />
                )}

                {/* All Other Tabs - Rendered via TabRenderer */}
                <TabRenderer
                  activeTab={activeTab}
                  settings={settings}
                  beneficiaryId={beneficiary.id}
                  beneficiary={beneficiary}
                />
              </div>
            </main>
          </SidebarInset>
        </div>
        
        {/* Mobile Bottom Navigation */}
        <BeneficiaryBottomNavigation />
      </SidebarProvider>
    </PageErrorBoundary>
  );
}
