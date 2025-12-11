/**
 * TabRenderer Component
 * مكون موحد لعرض التبويبات مع دعم الصلاحيات والتحميل الكسول
 */

import { Suspense, lazy, ComponentType } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loaded tab components with named exports
const LazyBeneficiaryProfileTab = lazy(() => 
  import("@/components/beneficiary/BeneficiaryProfileTab").then(m => ({ default: m.BeneficiaryProfileTab }))
);
const LazyBeneficiaryDistributionsTab = lazy(() => 
  import("@/components/beneficiary/BeneficiaryDistributionsTab").then(m => ({ default: m.BeneficiaryDistributionsTab }))
);
const LazyBeneficiaryStatementsTab = lazy(() => 
  import("@/components/beneficiary/BeneficiaryStatementsTab").then(m => ({ default: m.BeneficiaryStatementsTab }))
);
const LazyBeneficiaryPropertiesTab = lazy(() => 
  import("@/components/beneficiary/BeneficiaryPropertiesTab").then(m => ({ default: m.BeneficiaryPropertiesTab }))
);
const LazyWaqfSummaryTab = lazy(() => 
  import("@/components/beneficiary/WaqfSummaryTab").then(m => ({ default: m.WaqfSummaryTab }))
);
const LazyFamilyTreeTab = lazy(() => 
  import("@/components/beneficiary/FamilyTreeTab").then(m => ({ default: m.FamilyTreeTab }))
);
const LazyBankAccountsTab = lazy(() => 
  import("@/components/beneficiary/BankAccountsTab").then(m => ({ default: m.BankAccountsTab }))
);
const LazyFinancialReportsTab = lazy(() => 
  import("@/components/beneficiary/FinancialReportsTab").then(m => ({ default: m.FinancialReportsTab }))
);
const LazyApprovalsLogTab = lazy(() => 
  import("@/components/beneficiary/ApprovalsLogTab").then(m => ({ default: m.ApprovalsLogTab }))
);
const LazyDisclosuresTab = lazy(() => 
  import("@/components/beneficiary/DisclosuresTab").then(m => ({ default: m.DisclosuresTab }))
);
const LazyGovernanceTab = lazy(() => 
  import("@/components/beneficiary/GovernanceTab").then(m => ({ default: m.GovernanceTab }))
);
const LazyBudgetsTab = lazy(() => 
  import("@/components/beneficiary/BudgetsTab").then(m => ({ default: m.BudgetsTab }))
);
const LazyLoansOverviewTab = lazy(() => 
  import("@/components/beneficiary/LoansOverviewTab").then(m => ({ default: m.LoansOverviewTab }))
);

interface TabConfig {
  key: string;
  settingKey: string;
  component: ComponentType<{ beneficiaryId?: string; beneficiary?: unknown }>;
  requiresBeneficiaryId?: boolean;
  requiresBeneficiary?: boolean;
  alwaysVisible?: boolean;
}

const TAB_CONFIGS: TabConfig[] = [
  { key: "profile", settingKey: "show_profile", component: LazyBeneficiaryProfileTab, requiresBeneficiary: true },
  { key: "distributions", settingKey: "show_distributions", component: LazyBeneficiaryDistributionsTab, requiresBeneficiaryId: true },
  { key: "statements", settingKey: "show_statements", component: LazyBeneficiaryStatementsTab, requiresBeneficiaryId: true },
  { key: "properties", settingKey: "show_properties", component: LazyBeneficiaryPropertiesTab },
  { key: "waqf", settingKey: "show_waqf", component: LazyWaqfSummaryTab, alwaysVisible: true },
  { key: "family", settingKey: "show_family_tree", component: LazyFamilyTreeTab, requiresBeneficiaryId: true },
  { key: "bank", settingKey: "show_bank_accounts", component: LazyBankAccountsTab },
  { key: "reports", settingKey: "show_financial_reports", component: LazyFinancialReportsTab },
  { key: "approvals", settingKey: "show_approvals_log", component: LazyApprovalsLogTab },
  { key: "disclosures", settingKey: "show_disclosures", component: LazyDisclosuresTab },
  { key: "governance", settingKey: "show_governance", component: LazyGovernanceTab },
  { key: "budgets", settingKey: "show_budgets", component: LazyBudgetsTab },
  { key: "loans", settingKey: "show_own_loans", component: LazyLoansOverviewTab },
];

function TabSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function AccessDenied() {
  return (
    <Alert>
      <Lock className="h-4 w-4" />
      <AlertDescription>غير مصرح لك بالوصول لهذا القسم</AlertDescription>
    </Alert>
  );
}

interface TabRendererProps {
  activeTab: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: Record<string, any> | null;
  beneficiaryId?: string;
  beneficiary?: unknown;
}

export function TabRenderer({ activeTab, settings, beneficiaryId, beneficiary }: TabRendererProps) {
  // Skip overview tab - handled separately
  if (activeTab === "overview") return null;

  const tabConfig = TAB_CONFIGS.find(t => t.key === activeTab);
  
  if (!tabConfig) return null;

  const isVisible = tabConfig.alwaysVisible || settings?.[tabConfig.settingKey];
  
  if (!isVisible) {
    return <AccessDenied />;
  }

  const TabComponent = tabConfig.component;
  const props: Record<string, unknown> = {};
  
  if (tabConfig.requiresBeneficiaryId) {
    props.beneficiaryId = beneficiaryId;
  }
  if (tabConfig.requiresBeneficiary) {
    props.beneficiary = beneficiary;
  }

  return (
    <Suspense fallback={<TabSkeleton />}>
      <TabComponent {...props} />
    </Suspense>
  );
}
