import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Calculator 
} from "lucide-react";
import AccountsTree from "@/components/accounting/AccountsTree";
import JournalEntries from "@/components/accounting/JournalEntries";
import BudgetReports from "@/components/accounting/BudgetReports";
import FinancialReports from "@/components/accounting/FinancialReports";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("accounts");

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">النظام المحاسبي</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            إدارة الحسابات والقيود المحاسبية والميزانيات
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="accounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">شجرة الحسابات</span>
            <span className="sm:hidden">الحسابات</span>
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">القيود المحاسبية</span>
            <span className="sm:hidden">القيود</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">الميزانيات</span>
            <span className="sm:hidden">الميزانية</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2">
            <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">التقارير المالية</span>
            <span className="sm:hidden">التقارير</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-4">
          <Card className="p-3 sm:p-6">
            <AccountsTree />
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="mt-4">
          <Card className="p-3 sm:p-6">
            <JournalEntries />
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="mt-4">
          <Card className="p-3 sm:p-6">
            <BudgetReports />
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Card className="p-3 sm:p-6">
            <FinancialReports />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
