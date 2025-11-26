import { useState, useEffect } from "react";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { UnifiedPageContainer } from "@/components/unified/UnifiedPageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Activity, AlertCircle, Network, Database, Wrench, Crosshair, Smartphone } from "lucide-react";
import { DeveloperOverview } from "@/components/developer/DeveloperOverview";
import { WebVitalsPanel } from "@/components/developer/WebVitalsPanel";
import { ErrorsPanel } from "@/components/developer/ErrorsPanel";
import { NetworkMonitor } from "@/components/developer/NetworkMonitor";
import { StorageInspector } from "@/components/developer/StorageInspector";
import { ToolsPanel } from "@/components/developer/ToolsPanel";
import { ComponentInspector } from "@/components/developer/ComponentInspector";
import { ResponsiveTester } from "@/components/developer/ResponsiveTester";
import { useErrorNotifications } from "@/hooks/developer/useErrorNotifications";
import { usePerformanceBudget } from "@/hooks/developer/usePerformanceBudget";

export default function DeveloperTools() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // تفعيل الإشعارات الفورية للأخطاء
  useErrorNotifications();
  
  // تفعيل تنبيهات الأداء
  const { violations } = usePerformanceBudget();

  // قراءة tab من URL إن وجد
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  return (
    <PageErrorBoundary pageName="أدوات المطور">
      <UnifiedPageContainer maxWidth="full">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Code className="w-8 h-8 text-primary" />
                لوحة تحكم المطور
              </h1>
              <p className="text-muted-foreground mt-2">
                أدوات متقدمة لمراقبة وتحليل أداء التطبيق
              </p>
            </div>
          </div>

          {/* Performance Budget Violations */}
          {violations.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                ⚠️ تنبيهات الأداء ({violations.length})
              </h3>
              <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                {violations.slice(0, 3).map((v, i) => (
                  <li key={i}>• {v}</li>
                ))}
                {violations.length > 3 && (
                  <li className="text-xs">... و {violations.length - 3} تنبيهات أخرى</li>
                )}
              </ul>
            </div>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 h-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">نظرة عامة</span>
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2 py-3">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">الأداء</span>
              </TabsTrigger>
              <TabsTrigger value="errors" className="flex items-center gap-2 py-3">
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">الأخطاء</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="flex items-center gap-2 py-3">
                <Network className="w-4 h-4" />
                <span className="hidden sm:inline">الشبكة</span>
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-2 py-3">
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">التخزين</span>
              </TabsTrigger>
              <TabsTrigger value="tools" className="flex items-center gap-2 py-3">
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">الأدوات</span>
              </TabsTrigger>
              <TabsTrigger value="inspector" className="flex items-center gap-2 py-3">
                <Crosshair className="w-4 h-4" />
                <span className="hidden sm:inline">الفحص</span>
              </TabsTrigger>
              <TabsTrigger value="responsive" className="flex items-center gap-2 py-3">
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">الاستجابة</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <DeveloperOverview />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-6">
              <WebVitalsPanel />
            </TabsContent>

            <TabsContent value="errors" className="space-y-6 mt-6">
              <ErrorsPanel />
            </TabsContent>

            <TabsContent value="network" className="space-y-6 mt-6">
              <NetworkMonitor />
            </TabsContent>

            <TabsContent value="storage" className="space-y-6 mt-6">
              <StorageInspector />
            </TabsContent>

            <TabsContent value="tools" className="space-y-6 mt-6">
              <ToolsPanel />
            </TabsContent>

            <TabsContent value="inspector" className="space-y-6 mt-6">
              <ComponentInspector />
            </TabsContent>

            <TabsContent value="responsive" className="space-y-6 mt-6">
              <ResponsiveTester />
            </TabsContent>
          </Tabs>
        </div>
      </UnifiedPageContainer>
    </PageErrorBoundary>
  );
}
