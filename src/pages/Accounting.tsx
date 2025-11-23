import { useState } from "react";
import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { BankReconciliationDialog } from "@/components/accounting/BankReconciliationDialog";
import { AccountingHeader } from "@/components/accounting/AccountingHeader";
import { AccountingTabs } from "@/components/accounting/AccountingTabs";
import { useAccountingTabs } from "@/hooks/useAccountingTabs";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

const Accounting = () => {
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const { activeTab, isLoadingTab, handleTabChange } = useAccountingTabs();

  return (
    <PageErrorBoundary pageName="المحاسبة">
      <MobileOptimizedLayout>
        <AccountingHeader onBankReconciliation={() => setBankDialogOpen(true)} />

        <AccountingTabs 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isLoading={isLoadingTab}
        />

        <BankReconciliationDialog
          open={bankDialogOpen}
          onOpenChange={setBankDialogOpen}
        />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
};

export default Accounting;
