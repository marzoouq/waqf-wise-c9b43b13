import { useState, useMemo, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  FileText, 
  TrendingUp, 
  FileSpreadsheet,
  Building2,
  Wallet,
  Activity
} from "lucide-react";
import { EnhancedAccountsTree } from "@/components/accounting/EnhancedAccountsTree";
import JournalEntries from "@/components/accounting/JournalEntries";
import { TrialBalanceReport } from "@/components/accounting/TrialBalanceReport";
import GeneralLedgerReport from "@/components/accounting/GeneralLedgerReport";
import { BankReconciliationDialog } from "@/components/accounting/BankReconciliationDialog";
import { BankAccountsManagement } from "@/components/accounting/BankAccountsManagement";
import { CashFlowStatement } from "@/components/accounting/CashFlowStatement";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { ExportButton } from "@/components/shared/ExportButton";
import { useAccounts } from "@/hooks/useAccounts";

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
        "6": "bank-accounts",
        "7": "cash-flow",
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
    budgets: <div className="text-center py-8 text-muted-foreground">انتقل إلى صفحة الميزانيات من القائمة الجانبية</div>,
    "trial-balance": <TrialBalanceReport />,
    ledger: <GeneralLedgerReport />,
    "bank-accounts": <BankAccountsManagement />,
    "cash-flow": <CashFlowStatement />,
  }), []);

  return (
    <MobileOptimizedLayout>
      <MobileOptimizedHeader
        title="النظام المحاسبي"
        description="إدارة الحسابات والقيود المحاسبية والميزانيات"
        icon={<BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        actions={
          <Button onClick={() => setBankDialogOpen(true)} variant="outline" size="sm">
            <Building2 className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">التسوية البنكية</span>
            <span className="sm:hidden">التسوية</span>
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 h-auto gap-1">
          <TabsTrigger value="accounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+1">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">شجرة الحسابات</span>
            <span className="lg:hidden">الحسابات</span>
          </TabsTrigger>
          <TabsTrigger value="entries" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+2">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">القيود المحاسبية</span>
            <span className="lg:hidden">القيود</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+3">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">الميزانيات</span>
            <span className="lg:hidden">الميزانيات</span>
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+4">
            <FileSpreadsheet className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">ميزان المراجعة</span>
            <span className="lg:hidden">الميزان</span>
          </TabsTrigger>
          <TabsTrigger value="ledger" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+5">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">دفتر الأستاذ</span>
            <span className="lg:hidden">الأستاذ</span>
          </TabsTrigger>
          <TabsTrigger value="bank-accounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+6">
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">الحسابات البنكية</span>
            <span className="lg:hidden">البنوك</span>
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2" title="Alt+7">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden lg:inline">التدفقات النقدية</span>
            <span className="lg:hidden">التدفقات</span>
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
    </MobileOptimizedLayout>
  );
};

export default Accounting;
