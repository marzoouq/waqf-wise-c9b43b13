import { memo, useMemo, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingState } from "@/components/shared/LoadingState";
import { lazyWithRetry, lazyWithRetryNamed } from "@/lib/lazyWithRetry";
import {
  FileText,
  TreePine,
  DollarSign,
  Scale,
  Book,
  Building2,
  Activity,
  Sparkles,
} from "lucide-react";

// Lazy load components with retry for better reliability
const EnhancedAccountsTree = lazyWithRetryNamed(() => import("./EnhancedAccountsTree"), "EnhancedAccountsTree");
const JournalEntries = lazyWithRetry(() => import("./JournalEntries"));
const BudgetsContent = lazyWithRetryNamed(() => import("./BudgetsContent"), "BudgetsContent");
const TrialBalanceReport = lazyWithRetryNamed(() => import("./TrialBalanceReport"), "TrialBalanceReport");
const GeneralLedgerReport = lazyWithRetry(() => import("./GeneralLedgerReport"));
const BankAccountsManagement = lazyWithRetryNamed(() => import("./BankAccountsManagement"), "BankAccountsManagement");
const CashFlowStatement = lazyWithRetryNamed(() => import("./CashFlowStatement"), "CashFlowStatement");
const AdvancedAccountingTab = lazyWithRetryNamed(() => import("./AdvancedAccountingTab"), "AdvancedAccountingTab");

interface AccountingTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isLoading?: boolean;
}

export const AccountingTabs = memo(({ activeTab, onTabChange, isLoading }: AccountingTabsProps) => {
  const tabContent = useMemo(() => ({
    accounts: <EnhancedAccountsTree />,
    entries: <JournalEntries />,
    budgets: <BudgetsContent />,
    "trial-balance": <TrialBalanceReport />,
    ledger: <GeneralLedgerReport />,
    "bank-accounts": <BankAccountsManagement />,
    "cash-flow": <CashFlowStatement />,
    advanced: <AdvancedAccountingTab />,
  }), []);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <TabsList className="inline-flex h-auto items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="accounts" className="gap-2 text-xs sm:text-sm" title="Alt+1">
            <TreePine className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">شجرة الحسابات</span>
            <span className="sm:hidden">الحسابات</span>
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-2 text-xs sm:text-sm" title="Alt+2">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">القيود المحاسبية</span>
            <span className="sm:hidden">القيود</span>
          </TabsTrigger>
          <TabsTrigger value="budgets" className="gap-2 text-xs sm:text-sm" title="Alt+3">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>الميزانيات</span>
          </TabsTrigger>
          <TabsTrigger value="trial-balance" className="gap-2 text-xs sm:text-sm" title="Alt+4">
            <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">ميزان المراجعة</span>
            <span className="sm:hidden">الميزان</span>
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2 text-xs sm:text-sm" title="Alt+5">
            <Book className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">دفتر الأستاذ</span>
            <span className="sm:hidden">الأستاذ</span>
          </TabsTrigger>
          <TabsTrigger value="bank-accounts" className="gap-2 text-xs sm:text-sm" title="Alt+6">
            <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">الحسابات البنكية</span>
            <span className="sm:hidden">البنوك</span>
          </TabsTrigger>
          <TabsTrigger value="cash-flow" className="gap-2 text-xs sm:text-sm" title="Alt+7">
            <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">التدفقات النقدية</span>
            <span className="sm:hidden">التدفقات</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2 text-xs sm:text-sm" title="Alt+8">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">متقدم</span>
            <span className="sm:hidden">متقدم</span>
          </TabsTrigger>
        </TabsList>
      </ScrollArea>

      {Object.entries(tabContent).map(([key, content]) => (
        <TabsContent key={key} value={key} className="mt-4">
          {isLoading ? (
            <LoadingState message="جاري التحميل..." />
          ) : (
            <Suspense fallback={<LoadingState message="جاري التحميل..." />}>
              {content}
            </Suspense>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
});

AccountingTabs.displayName = 'AccountingTabs';
