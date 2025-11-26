import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, GitBranch, Sparkles, TrendingUp, Settings, FileCheck } from "lucide-react";
import { AutoJournalTemplatesManager } from "./AutoJournalTemplatesManager";
import { AutoJournalTemplates } from "./AutoJournalTemplates";
import { ApprovalWorkflowBuilder } from "./ApprovalWorkflowBuilder";
import { ApprovalWorkflowManager } from "./ApprovalWorkflowManager";
import { FinancialAnalyticsDashboard } from "./FinancialAnalyticsDashboard";
import { BudgetManagement } from "./BudgetManagement";
import { InvoiceManagement } from "./InvoiceManagement";

export function AdvancedAccountingTab() {
  return (
    <Tabs defaultValue="auto-journal" className="w-full">
      <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
        <TabsTrigger value="auto-journal" className="gap-2">
          <Zap className="h-4 w-4" />
          <span className="hidden sm:inline">القيود التلقائية</span>
          <span className="sm:hidden">القيود</span>
        </TabsTrigger>
        <TabsTrigger value="budgets" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">الموازنات</span>
          <span className="sm:hidden">موازنات</span>
        </TabsTrigger>
        <TabsTrigger value="invoices" className="gap-2">
          <FileCheck className="h-4 w-4" />
          <span className="hidden sm:inline">الفواتير</span>
          <span className="sm:hidden">فواتير</span>
        </TabsTrigger>
        <TabsTrigger value="workflows" className="gap-2">
          <GitBranch className="h-4 w-4" />
          <span className="hidden sm:inline">الموافقات</span>
          <span className="sm:hidden">موافقات</span>
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="hidden sm:inline">التحليلات</span>
          <span className="sm:hidden">تحليلات</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="auto-journal" className="mt-4">
        <AutoJournalTemplates />
      </TabsContent>

      <TabsContent value="budgets" className="mt-4">
        <BudgetManagement />
      </TabsContent>

      <TabsContent value="invoices" className="mt-4">
        <InvoiceManagement />
      </TabsContent>

      <TabsContent value="workflows" className="mt-4">
        <ApprovalWorkflowManager />
      </TabsContent>

      <TabsContent value="analytics" className="mt-4">
        <FinancialAnalyticsDashboard />
      </TabsContent>
    </Tabs>
  );
}
