/**
 * TabRenderer Component
 * مكون موحد لعرض التبويبات مع دعم الصلاحيات والتحميل الكسول
 * @version 4.1.0 - إضافة Retry للتحميل الديناميكي
 */

import { Suspense, ComponentType } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabErrorBoundary } from "./common/TabErrorBoundary";
import { lazyWithRetryNamed } from "@/lib/lazy-with-retry";
import type { VisibilitySettings } from "@/hooks/governance/useVisibilitySettings";

// Lazy loaded tab components with retry support
const LazyBeneficiaryProfileTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/BeneficiaryProfileTab"),
  "BeneficiaryProfileTab"
);
const LazyBeneficiaryDistributionsTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/BeneficiaryDistributionsTab"),
  "BeneficiaryDistributionsTab"
);
const LazyBeneficiaryPropertiesTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/BeneficiaryPropertiesTab"),
  "BeneficiaryPropertiesTab"
);
const LazyFamilyTreeTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/FamilyTreeTab"),
  "FamilyTreeTab"
);
const LazyBankAccountsTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/BankAccountsTab"),
  "BankAccountsTab"
);
const LazyFinancialReportsTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/FinancialReportsTab"),
  "FinancialReportsTab"
);
const LazyGovernanceTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/GovernanceTab"),
  "GovernanceTab"
);
const LazyLoansOverviewTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/LoansOverviewTab"),
  "LoansOverviewTab"
);
const LazyBeneficiaryRequestsTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/BeneficiaryRequestsTab"),
  "BeneficiaryRequestsTab"
);
const LazyBeneficiaryDocumentsTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/BeneficiaryDocumentsTab"),
  "BeneficiaryDocumentsTab"
);
// New consolidated tabs
const LazyFamilyAccountTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/FamilyAccountTab"),
  "FamilyAccountTab"
);
const LazyMoreMenuTab = lazyWithRetryNamed(
  () => import("@/components/beneficiary/tabs/MoreMenuTab"),
  "MoreMenuTab"
);

interface TabConfig {
  key: string;
  settingKey: keyof VisibilitySettings;
  component: ComponentType<{ beneficiaryId?: string; beneficiary?: unknown }>;
  requiresBeneficiaryId?: boolean;
  requiresBeneficiary?: boolean;
  alwaysVisible?: boolean;
}

/**
 * التبويبات المُدمجة (Main Navigation):
 * - "family-account": حساب العائلة (يحتوي على: الملف الشخصي + شجرة العائلة + الحسابات البنكية)
 * - "more": قائمة المزيد (يحتوي على: التقارير، العقارات، المستندات، القروض، الحوكمة)
 * 
 * التبويبات الفرعية (Sub Navigation):
 * - "reports-detail": للوصول المباشر لصفحة التقارير من قائمة "المزيد"
 * 
 * التبويبات القديمة (Legacy - للتوافق مع القوائم الجانبية):
 * - profile, requests, distributions, properties, documents, family, bank, reports, governance, loans
 */
const TAB_CONFIGS: TabConfig[] = [
  // التبويبات الرئيسية (الشريط السفلي)
  { key: "family-account", settingKey: "show_family_tree", component: LazyFamilyAccountTab, requiresBeneficiaryId: true, requiresBeneficiary: true },
  { key: "more", settingKey: "show_overview", component: LazyMoreMenuTab, alwaysVisible: true },
  
  // التبويبات الفرعية (من قائمة "المزيد")
  { key: "reports-detail", settingKey: "show_financial_reports", component: LazyFinancialReportsTab },
  
  // التبويبات الأصلية للتوافق مع القائمة الجانبية
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

  const isVisible = tabConfig.alwaysVisible === true || settings?.[tabConfig.settingKey] === true;
  
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
    "family-account": "حساب العائلة",
    "more": "المزيد",
    "reports-detail": "التقارير المالية",
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
