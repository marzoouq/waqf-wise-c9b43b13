import BeneficiaryDialog from "@/components/beneficiaries/BeneficiaryDialog";
import { PropertyDialog } from "@/components/properties/PropertyDialog";
import { DistributionDialog } from "@/components/funds/DistributionDialog";
import { AdminSendMessageDialog } from "@/components/messages/AdminSendMessageDialog";

interface DashboardDialogsProps {
  beneficiaryDialogOpen: boolean;
  setBeneficiaryDialogOpen: (open: boolean) => void;
  propertyDialogOpen: boolean;
  setPropertyDialogOpen: (open: boolean) => void;
  distributionDialogOpen: boolean;
  setDistributionDialogOpen: (open: boolean) => void;
  messageDialogOpen: boolean;
  setMessageDialogOpen: (open: boolean) => void;
}

export function DashboardDialogs({
  beneficiaryDialogOpen,
  setBeneficiaryDialogOpen,
  propertyDialogOpen,
  setPropertyDialogOpen,
  distributionDialogOpen,
  setDistributionDialogOpen,
  messageDialogOpen,
  setMessageDialogOpen,
}: DashboardDialogsProps) {
  return (
    <>
      <BeneficiaryDialog
        open={beneficiaryDialogOpen}
        onOpenChange={setBeneficiaryDialogOpen}
        onSave={() => setBeneficiaryDialogOpen(false)}
      />
      <PropertyDialog
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
        onSave={() => setPropertyDialogOpen(false)}
      />
      <DistributionDialog
        open={distributionDialogOpen}
        onOpenChange={setDistributionDialogOpen}
        onDistribute={() => setDistributionDialogOpen(false)}
      />
      <AdminSendMessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
      />
    </>
  );
}
