import { useState } from "react";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { UnifiedPageContainer } from "@/components/unified/UnifiedPageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Activity, AlertCircle, Network, Database, Wrench } from "lucide-react";
import { DeveloperOverview } from "@/components/developer/DeveloperOverview";
import { WebVitalsPanel } from "@/components/developer/WebVitalsPanel";
import { ErrorsPanel } from "@/components/developer/ErrorsPanel";
import { NetworkMonitor } from "@/components/developer/NetworkMonitor";
import { StorageInspector } from "@/components/developer/StorageInspector";
import { ToolsPanel } from "@/components/developer/ToolsPanel";

export default function DeveloperTools() {
  const [activeTab, setActiveTab] = useState("overview");

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

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto">
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
          </Tabs>
        </div>
      </UnifiedPageContainer>
    </PageErrorBoundary>
  );
}
