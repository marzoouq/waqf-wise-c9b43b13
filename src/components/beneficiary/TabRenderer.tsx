/**
 * TabRenderer Component
 * مكون موحد لعرض التبويبات مع دعم الصلاحيات والتحميل الكسول
 * @version 3.0.0 - إصدار مُحسّن بدون تكرار
 */

import { Suspense, lazy, ComponentType } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabErrorBoundary } from "./common/TabErrorBoundary";
import type { VisibilitySettings } from "@/hooks/governance/useVisibilitySettings";

// Lazy loaded tab components
const LazyBeneficiaryProfileTab = lazy(() => 
  import("@/components/beneficiary/tabs/BeneficiaryProfileTab").then(m => ({ default: m.BeneficiaryProfileTab }))
);
const LazyBeneficiaryDistributionsTab = lazy(() => 
  import("@/components/beneficiary/tabs/BeneficiaryDistributionsTab").then(m => ({ default: m.BeneficiaryDistributionsTab }))
);
const LazyBeneficiaryPropertiesTab = lazy(() => 
  import("@/components/beneficiary/tabs/BeneficiaryPropertiesTab").then(m => ({ default: m.BeneficiaryPropertiesTab }))
);
const LazyFamilyTreeTab = lazy(() => 
  import("@/components/beneficiary/tabs/FamilyTreeTab").then(m => ({ default: m.FamilyTreeTab }))
);
const LazyBankAccountsTab = lazy(() => 
  import("@/components/beneficiary/tabs/BankAccountsTab").then(m => ({ default: m.BankAccountsTab }))
);
const LazyFinancialReportsTab = lazy(() => 
  import("@/components/beneficiary/tabs/FinancialReportsTab").then(m => ({ default: m.FinancialReportsTab }))
);
const LazyGovernanceTab = lazy(() => 
  import("@/components/beneficiary/tabs/GovernanceTab").then(m => ({ default: m.GovernanceTab }))
);
const LazyLoansOverviewTab = lazy(() => 
  import("@/components/beneficiary/tabs/LoansOverviewTab").then(m => ({ default: m.LoansOverviewTab }))
);
const LazyBeneficiaryRequestsTab = lazy(() => 
  import("@/components/beneficiary/tabs/BeneficiaryRequestsTab").then(m => ({ default: m.BeneficiaryRequestsTab }))
);
const LazyBeneficiaryDocumentsTab = lazy(() => 
  import("@/components/beneficiary/tabs/BeneficiaryDocumentsTab").then(m => ({ default: m.BeneficiaryDocumentsTab }))
);

interface TabConfig {
  key: string;
  settingKey: string;
  component: ComponentType<{ beneficiaryId?: string; beneficiary?: unknown }>;
  requiresBeneficiaryId?: boolean;
  requiresBeneficiary?: boolean;
  alwaysVisible?: boolean;
}

/**
 * التبويبات المُدمجة:
 * - "distributions" يشمل الآن كشف الحساب أيضاً
 * - "reports" يشمل الإفصاحات السنوية
 * - "governance" يشمل الميزانيات وسجل الموافقات
 */
const TAB_CONFIGS: TabConfig[] = [
  { key: "profile", settingKey: "show_profile", component: LazyBeneficiaryProfileTab, requiresBeneficiary: true },
  { key: "requests", settingKey: "show_requests", component: LazyBeneficiaryRequestsTab, requiresBeneficiaryId: true },
  { key: "distributions", settingKey: "show_distributions", component: LazyBeneficiaryDistributionsTab, requiresBeneficiaryId: true },
  { key: "properties", settingKey: "show_properties", component: LazyBeneficiaryPropertiesTab },
  { key: "documents", settingKey: "show_documents", component: LazyBeneficiaryDocumentsTab, requiresBeneficiaryId: true },
  { key: "family", settingKey: "show_family_tree", component: LazyFamilyTreeTab, requiresBeneficiaryId: true },
  { key: "bank", settingKey: "show_bank_accounts", component: LazyBankAccountsTab },
  { key: "reports", settingKey: "show_financial_reports", component: LazyFinancialReportsTab },
  { key: "governance", settingKey: "show_governance", component: LazyGovernanceTab },
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
  settings: Partial<VisibilitySettings> | null;
  beneficiaryId?: string;
  beneficiary?: unknown;
}

export function TabRenderer({ activeTab, settings, beneficiaryId, beneficiary }: TabRendererProps) {
  // Skip overview tab - handled separately
  if (activeTab === "overview") return null;

  const tabConfig = TAB_CONFIGS.find(t => t.key === activeTab);
  
  if (!tabConfig) return null;

  const isVisible = tabConfig.alwaysVisible || settings?.[tabConfig.settingKey as keyof typeof settings];
  
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

  const tabNames: Record<string, string> = {
    profile: "الملف الشخصي",
    requests: "الطلبات",
    distributions: "التوزيعات والأرصدة",
    properties: "العقارات",
    documents: "المستندات",
    family: "شجرة العائلة",
    bank: "الحسابات البنكية",
    reports: "التقارير والإفصاحات",
    governance: "الحوكمة",
    loans: "القروض",
  };

  return (
    <TabErrorBoundary tabName={tabNames[activeTab] || activeTab}>
      <Suspense fallback={<TabSkeleton />}>
        <TabComponent {...props} />
      </Suspense>
    </TabErrorBoundary>
  );
}
