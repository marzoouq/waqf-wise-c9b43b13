import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  Calculator,
  FileSpreadsheet
} from "lucide-react";
import AccountsTree from "@/components/accounting/AccountsTree";
import JournalEntries from "@/components/accounting/JournalEntries";
import BudgetReports from "@/components/accounting/BudgetReports";
import FinancialReports from "@/components/accounting/FinancialReports";
import GeneralLedgerReport from "@/components/accounting/GeneralLedgerReport";
import DetailedTrialBalance from "@/components/accounting/DetailedTrialBalance";
import { LoadingState } from "@/components/shared/LoadingState";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [isLoadingTab, setIsLoadingTab] = useState(false);

  // Keyboard shortcuts for tabs
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.altKey) {
      const tabMap: Record<string, string> = {
        "1": "accounts",
        "2": "entries",
        "3": "budgets",
        "4": "reports",
        "5": "ledger",
        "6": "trial-balance",
      };
      
      if (tabMap[e.key]) {
        e.preventDefault();
        setActiveTab(tabMap[e.key]);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Simulate loading when switching tabs
  const handleTabChange = useCallback((value: string) => {
    setIsLoadingTab(true);
    setActiveTab(value);
    setTimeout(() => setIsLoadingTab(false), 300);
  }, []);

  const tabContent = useMemo(() => ({
    accounts: <AccountsTree />,
    entries: <JournalEntries />,
    budgets: <BudgetReports />,
    reports: <FinancialReports />,
    ledger: <GeneralLedgerReport />,
    "trial-balance": <DetailedTrialBalance />,
  }), []);

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">النظام المحاسبي</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            إدارة الحسابات والقيود المحاسبية والميزانيات
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="accounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+1">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">شجرة الحسابات</span>
            <span className="sm:hidden">الحسابات</span>
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+2">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">القيود المحاسبية</span>
            <span className="sm:hidden">القيود</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+3">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">الميزانيات</span>
            <span className="sm:hidden">الميزانية</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+4">
            <Calculator className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">التقارير المالية</span>
            <span className="sm:hidden">التقارير</span>
          </TabsTrigger>
          <TabsTrigger value="ledger" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+5">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">دفتر الأستاذ</span>
            <span className="sm:hidden">الأستاذ</span>
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+6">
            <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">ميزان المراجعة</span>
            <span className="sm:hidden">الميزان</span>
          </TabsTrigger>
        </TabsList>

        {Object.entries(tabContent).map(([key, content]) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card className="p-3 sm:p-6">
              {isLoadingTab ? (
                <LoadingState size="sm" message="جاري التحميل..." />
              ) : (
                content
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Accounting;
