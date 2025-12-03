import { memo } from "react";
import { Plus, MoreHorizontal, Printer, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeneficiariesPrintButton } from "../BeneficiariesPrintButton";
import { BeneficiariesImporter } from "../BeneficiariesImporter";
import { CreateBeneficiaryAccountsButton } from "../CreateBeneficiaryAccountsButton";
import { Beneficiary } from "@/types/beneficiary";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BeneficiariesHeaderProps {
  filteredBeneficiaries: Beneficiary[];
  onAddBeneficiary: () => void;
  onImportSuccess: () => void;
}

export const BeneficiariesHeader = memo(function BeneficiariesHeader({ 
  filteredBeneficiaries, 
  onAddBeneficiary,
  onImportSuccess
}: BeneficiariesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gradient-primary truncate">
          سجل المستفيدين
        </h1>
        <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">
          إدارة بيانات الأفراد المستفيدين من الوقف
        </p>
      </div>
      
      {/* Desktop Actions */}
      <div className="hidden sm:flex flex-wrap gap-2">
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

      {/* Mobile Actions - Compact row */}
      <div className="flex sm:hidden items-center gap-2 w-full">
        <Button 
          className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground text-xs"
          onClick={onAddBeneficiary}
          size="sm"
        >
          <Plus className="ml-1.5 h-3.5 w-3.5" />
          إضافة مستفيد
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="p-1">
              <CreateBeneficiaryAccountsButton />
            </div>
            <div className="p-1">
              <BeneficiariesPrintButton beneficiaries={filteredBeneficiaries} />
            </div>
            <div className="p-1">
              <BeneficiariesImporter onSuccess={onImportSuccess} />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});
