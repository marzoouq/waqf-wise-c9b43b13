import { useState, useEffect } from "react";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Code, Activity, AlertCircle, Network, Database, Wrench, Crosshair, Smartphone, Search } from "lucide-react";
import { DeveloperOverview } from "@/components/developer/DeveloperOverview";
import { WebVitalsPanel } from "@/components/developer/WebVitalsPanel";
import { ErrorsPanel } from "@/components/developer/ErrorsPanel";
import { NetworkMonitor } from "@/components/developer/NetworkMonitor";
import { StorageInspector } from "@/components/developer/StorageInspector";
import { ToolsPanel } from "@/components/developer/ToolsPanel";
import { ComponentInspector } from "@/components/developer/ComponentInspector";
import { ResponsiveTester } from "@/components/developer/ResponsiveTester";
import { DeepDiagnosticsPanel } from "@/components/developer/DeepDiagnosticsPanel";

export default function DeveloperTools() {
  const [activeTab, setActiveTab] = useState("overview");

  // قراءة tab من URL إن وجد
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, []);

  return (
    <PageErrorBoundary pageName="أدوات المطور">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="لوحة تحكم المطور"
          description="أدوات متقدمة لمراقبة وتحليل أداء التطبيق"
          icon={<Code className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="w-full">
              <TabsList className="inline-flex w-full min-w-max h-auto p-1">
                <TabsTrigger value="overview" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">نظرة عامة</span>
                </TabsTrigger>
                <TabsTrigger value="performance" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">الأداء</span>
                </TabsTrigger>
                <TabsTrigger value="errors" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <AlertCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">الأخطاء</span>
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Network className="w-4 h-4" />
                  <span className="hidden sm:inline">الشبكة</span>
                </TabsTrigger>
                <TabsTrigger value="storage" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">التخزين</span>
                </TabsTrigger>
                <TabsTrigger value="tools" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Wrench className="w-4 h-4" />
                  <span className="hidden sm:inline">الأدوات</span>
                </TabsTrigger>
                <TabsTrigger value="inspector" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Crosshair className="w-4 h-4" />
                  <span className="hidden sm:inline">الفحص</span>
                </TabsTrigger>
                <TabsTrigger value="responsive" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">الاستجابة</span>
                </TabsTrigger>
                <TabsTrigger value="diagnostics" className="flex items-center gap-1 py-3 text-xs sm:text-sm min-h-[44px]">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">التشخيص العميق</span>
                </TabsTrigger>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

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

            <TabsContent value="diagnostics" className="space-y-6 mt-6">
              <DeepDiagnosticsPanel />
            </TabsContent>
          </Tabs>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
