import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  FileSpreadsheet,
  Building2
} from "lucide-react";
import { EnhancedAccountsTree } from "@/components/accounting/EnhancedAccountsTree";
import JournalEntries from "@/components/accounting/JournalEntries";
import BudgetReports from "@/components/accounting/BudgetReports";
import { TrialBalanceReport } from "@/components/accounting/TrialBalanceReport";
import GeneralLedgerReport from "@/components/accounting/GeneralLedgerReport";
import { BankReconciliationDialog } from "@/components/accounting/BankReconciliationDialog";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";

const Accounting = () => {
  const [activeTab, setActiveTab] = useState("accounts");
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [bankDialogOpen, setBankDialogOpen] = useState(false);

  // Keyboard shortcuts for tabs
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.altKey) {
      const tabMap: Record<string, string> = {
        "1": "accounts",
        "2": "entries",
        "3": "budgets",
        "4": "trial-balance",
        "5": "ledger",
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
    accounts: <EnhancedAccountsTree />,
    entries: <JournalEntries />,
    budgets: <BudgetReports />,
    "trial-balance": <TrialBalanceReport />,
    ledger: <GeneralLedgerReport />,
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
        <Button onClick={() => setBankDialogOpen(true)} variant="outline">
          <Building2 className="ml-2 h-4 w-4" />
          التسوية البنكية
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
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
          <TabsTrigger value="trial-balance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+4">
            <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">ميزان المراجعة</span>
            <span className="sm:hidden">الميزان</span>
          </TabsTrigger>
          <TabsTrigger value="ledger" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+5">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">دفتر الأستاذ</span>
            <span className="sm:hidden">الأستاذ</span>
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

      <BankReconciliationDialog
        open={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
      />
    </div>
  );
};

export default Accounting;
