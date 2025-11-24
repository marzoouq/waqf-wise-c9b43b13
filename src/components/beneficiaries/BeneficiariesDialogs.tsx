import { Beneficiary } from "@/types/beneficiary";
import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { AdvancedSearchDialog, SearchCriteria } from "@/components/beneficiaries/AdvancedSearchDialog";
import { AttachmentsDialog } from "@/components/beneficiaries/AttachmentsDialog";
import { ActivityLogDialog } from "@/components/beneficiaries/ActivityLogDialog";
import { EnableLoginDialog } from "@/components/beneficiaries/EnableLoginDialog";
import { TribeManagementDialog } from "@/components/beneficiaries/TribeManagementDialog";

interface BeneficiariesDialogsProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  advancedSearchOpen: boolean;
  setAdvancedSearchOpen: (open: boolean) => void;
  attachmentsDialogOpen: boolean;
  setAttachmentsDialogOpen: (open: boolean) => void;
  activityLogDialogOpen: boolean;
  setActivityLogDialogOpen: (open: boolean) => void;
  enableLoginDialogOpen: boolean;
  setEnableLoginDialogOpen: (open: boolean) => void;
  tribeManagementDialogOpen: boolean;
  setTribeManagementDialogOpen: (open: boolean) => void;
  selectedBeneficiary: Beneficiary | null;
  onSaveBeneficiary: (data: Omit<Beneficiary, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onAdvancedSearch: (criteria: SearchCriteria) => void;
  onSuccessCallback?: () => void;
}

export function BeneficiariesDialogs({
  dialogOpen,
  setDialogOpen,
  advancedSearchOpen,
  setAdvancedSearchOpen,
  attachmentsDialogOpen,
  setAttachmentsDialogOpen,
  activityLogDialogOpen,
  setActivityLogDialogOpen,
  enableLoginDialogOpen,
  setEnableLoginDialogOpen,
  tribeManagementDialogOpen,
  setTribeManagementDialogOpen,
  selectedBeneficiary,
  onSaveBeneficiary,
  onAdvancedSearch,
  onSuccessCallback,
}: BeneficiariesDialogsProps) {
  return (
    <>
      <BeneficiaryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        beneficiary={selectedBeneficiary}
        onSave={onSaveBeneficiary}
      />

      <AdvancedSearchDialog
        open={advancedSearchOpen}
        onOpenChange={setAdvancedSearchOpen}
        onSearch={onAdvancedSearch}
      />

      {selectedBeneficiary && (
        <>
          <AttachmentsDialog
            open={attachmentsDialogOpen}
            onOpenChange={setAttachmentsDialogOpen}
            beneficiaryId={selectedBeneficiary.id}
            beneficiaryName={selectedBeneficiary.full_name}
          />

          <ActivityLogDialog
            open={activityLogDialogOpen}
            onOpenChange={setActivityLogDialogOpen}
            beneficiaryId={selectedBeneficiary.id}
            beneficiaryName={selectedBeneficiary.full_name}
          />

          <EnableLoginDialog
            open={enableLoginDialogOpen}
            onOpenChange={setEnableLoginDialogOpen}
            beneficiary={selectedBeneficiary}
            onSuccess={onSuccessCallback}
          />
        </>
      )}

      <TribeManagementDialog
        open={tribeManagementDialogOpen}
        onOpenChange={setTribeManagementDialogOpen}
      />
    </>
  );
}
