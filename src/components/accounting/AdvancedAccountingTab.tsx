import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, GitBranch, Sparkles, TrendingUp } from "lucide-react";
import { AutoJournalTemplatesManager } from "./AutoJournalTemplatesManager";
import { ApprovalWorkflowBuilder } from "./ApprovalWorkflowBuilder";
import { FinancialAnalyticsDashboard } from "./FinancialAnalyticsDashboard";

export function AdvancedAccountingTab() {
  return (
    <Tabs defaultValue="auto-journal" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="auto-journal" className="gap-2">
          <Zap className="h-4 w-4" />
          القيود التلقائية
        </TabsTrigger>
        <TabsTrigger value="workflows" className="gap-2">
          <GitBranch className="h-4 w-4" />
          مسارات الموافقات
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          التحليلات المالية
        </TabsTrigger>
      </TabsList>

      <TabsContent value="auto-journal" className="mt-4">
        <AutoJournalTemplatesManager />
      </TabsContent>

      <TabsContent value="workflows" className="mt-4">
        <ApprovalWorkflowBuilder />
      </TabsContent>

      <TabsContent value="analytics" className="mt-4">
        <FinancialAnalyticsDashboard />
      </TabsContent>
    </Tabs>
  );
}
