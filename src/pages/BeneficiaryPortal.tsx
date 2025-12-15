import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { AlertCircle, Menu } from "lucide-react";
import type { Beneficiary } from "@/types/beneficiary";
import { FiscalYearNotPublishedBanner } from "@/components/beneficiary/FiscalYearNotPublishedBanner";
import { PreviewModeBanner } from "@/components/beneficiary/PreviewModeBanner";
import { OverviewSection } from "@/components/beneficiary/sections/OverviewSection";
import { TabRenderer } from "@/components/beneficiary/TabRenderer";
import { useMemo, useCallback, useState } from "react";
import { BeneficiarySidebar } from "@/components/beneficiary/BeneficiarySidebar";
import { BeneficiaryBottomNavigation } from "@/components/mobile/BeneficiaryBottomNavigation";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { useBeneficiaryPortalData } from "@/hooks/beneficiary/useBeneficiaryPortalData";
import { useBeneficiarySession } from "@/hooks/beneficiary/useBeneficiarySession";
import { ErrorState } from "@/components/shared/ErrorState";
import { useBeneficiaryDashboardRealtime } from "@/hooks/dashboard/useBeneficiaryDashboardRealtime";
import { useQueryClient } from "@tanstack/react-query";

export default function BeneficiaryPortal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { settings } = useVisibilitySettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <div className="flex flex-col h-screen bg-background overflow-hidden">
        {/* Mobile Header - ثابت في الأعلى للجوال فقط */}
        <header className="fixed top-0 inset-x-0 z-40 h-14 bg-background border-b flex items-center px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="فتح القائمة"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="flex-1 text-center font-semibold text-sm">بوابة الوقف</h1>
          <div className="w-10" /> {/* Spacer للتوازن */}
        </header>

        <div className="flex flex-1 pt-14 lg:pt-0">
          {/* Sidebar */}
          <BeneficiarySidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            beneficiaryName={beneficiary.full_name}
            mobileOpen={mobileMenuOpen}
            onMobileOpenChange={setMobileMenuOpen}
          />

          {/* Main Content - مع padding للسايدبار على Desktop */}
          <main className="flex-1 lg:me-64 overflow-y-auto overscroll-contain scroll-smooth touch-pan-y">
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
        </div>
        
        {/* Mobile Bottom Navigation */}
        <BeneficiaryBottomNavigation />
      </div>
    </PageErrorBoundary>
  );
}
