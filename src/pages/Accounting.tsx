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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">النظام المحاسبي</h1>
          <p className="text-muted-foreground mt-1">
            إدارة الحسابات والقيود المحاسبية والميزانيات
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>شجرة الحسابات</span>
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>القيود المحاسبية</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>الميزانيات</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span>التقارير المالية</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card className="p-6">
            <AccountsTree />
          </Card>
        </TabsContent>

        <TabsContent value="entries" className="space-y-4">
          <Card className="p-6">
            <JournalEntries />
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card className="p-6">
            <BudgetReports />
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6">
            <FinancialReports />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Accounting;
