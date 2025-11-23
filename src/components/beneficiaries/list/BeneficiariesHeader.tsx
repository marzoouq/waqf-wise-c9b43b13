import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeneficiariesPrintButton } from "@/components/beneficiaries/BeneficiariesPrintButton";
import { BeneficiariesImporter } from "@/components/beneficiaries/BeneficiariesImporter";
import { CreateBeneficiaryAccountsButton } from "@/components/beneficiaries/CreateBeneficiaryAccountsButton";
import { Beneficiary } from "@/types/beneficiary";

interface BeneficiariesHeaderProps {
  filteredBeneficiaries: Beneficiary[];
  onAddBeneficiary: () => void;
  onImportSuccess: () => void;
}

export function BeneficiariesHeader({ 
  filteredBeneficiaries, 
  onAddBeneficiary,
  onImportSuccess
}: BeneficiariesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient-primary">
          سجل المستفيدين
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          إدارة بيانات الأفراد المستفيدين من الوقف
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <CreateBeneficiaryAccountsButton />
        <BeneficiariesPrintButton beneficiaries={filteredBeneficiaries} />
        <BeneficiariesImporter onSuccess={onImportSuccess} />
        <Button 
          className="bg-primary hover:bg-primary-hover text-primary-foreground shadow-soft hover:shadow-medium transition-all duration-300"
          onClick={onAddBeneficiary}
          size="sm"
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة مستفيد
        </Button>
      </div>
    </div>
  );
}
