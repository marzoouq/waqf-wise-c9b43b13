import { useEffect } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useContracts, Contract } from "@/hooks/useContracts";
import { useProperties } from "@/hooks/useProperties";
import { usePropertyUnits } from "@/hooks/usePropertyUnits";
import { toast } from "@/hooks/ui/use-toast";
import { Lightbulb } from "lucide-react";
import { useContractForm } from "./contract/useContractForm";
import { ContractTenantFields } from "./contract/ContractTenantFields";
import { ContractCalculations } from "./contract/ContractCalculations";
import { ContractUnitsSelector } from "./contract/ContractUnitsSelector";
import { ContractRenewalOptions } from "./contract/ContractRenewalOptions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: Contract | null;
}

export const ContractDialog = ({ open, onOpenChange, contract }: Props) => {
  const { addContract, updateContract } = useContracts();
  const { properties } = useProperties();
  const {
    formData,
    updateFormData,
    contractDuration,
    setContractDuration,
    durationUnit,
    setDurationUnit,
    totalAmount,
    setTotalAmount,
    selectedPropertyId,
    setSelectedPropertyId,
    selectedUnits,
    setSelectedUnits,
    toggleUnit,
    resetForm,
  } = useContractForm(contract);
  
  const { units, isLoading: unitsLoading } = usePropertyUnits(selectedPropertyId);

  // تحديث العقار المحدد فوراً عند التغيير
  useEffect(() => {
    if (formData.property_id && formData.property_id !== selectedPropertyId) {
      setSelectedPropertyId(formData.property_id);
      if (!contract) {
        setSelectedUnits([]);
      }
    }
  }, [formData.property_id, selectedPropertyId, contract, setSelectedPropertyId, setSelectedUnits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من الوحدات
    if (!contract && selectedUnits.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب اختيار وحدة واحدة على الأقل",
        variant: "destructive",
      });
      return;
    }

    // التحقق من المدة
    if (!contract && contractDuration < 1) {
      toast({
        title: "خطأ",
        description: "مدة العقد يجب أن تكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    // التحقق من المبلغ
    if (!contract && (parseFloat(totalAmount) <= 0 || !totalAmount)) {
      toast({
        title: "خطأ",
        description: "المبلغ الإجمالي يجب أن يكون أكبر من صفر",
        variant: "destructive",
      });
      return;
    }

    // التحقق من التواريخ
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    if (endDate <= startDate) {
      toast({
        title: "خطأ",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive",
      });
      return;
    }

    // التحقق من الإيجار الشهري
    const monthlyRent = parseFloat(formData.monthly_rent);
    if (monthlyRent <= 0 || isNaN(monthlyRent)) {
      toast({
        title: "خطأ",
        description: "الإيجار الشهري غير صحيح",
        variant: "destructive",
      });
      return;
    }

    const contractData = {
      ...formData,
      monthly_rent: monthlyRent,
      security_deposit: parseFloat(formData.security_deposit) || 0,
      renewal_notice_days: parseInt(formData.renewal_notice_days),
      units_count: selectedUnits.length,
      unit_ids: selectedUnits,
    };

    if (contract) {
      updateContract.mutate({ id: contract.id, ...contractData });
    } else {
      addContract.mutate(contractData);
    }
    onOpenChange(false);
    resetForm();
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={contract ? "تعديل عقد" : "إضافة عقد جديد"}
      description={contract ? "تعديل بيانات العقد" : "أدخل بيانات العقد الجديد"}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!contract && (
          <div className="bg-info/10 border border-info/30 rounded-lg p-3 text-sm mb-4">
            <p className="text-info-foreground">
              💡 <strong>ملاحظة:</strong> اختر العقار أولاً لعرض الوحدات المتاحة للتأجير
            </p>
          </div>
        )}
        
        <ContractTenantFields 
          formData={formData}
          onUpdate={updateFormData}
          properties={properties}
        />

        <ContractCalculations
          formData={formData}
          onUpdate={updateFormData}
          contractDuration={contractDuration}
          setContractDuration={setContractDuration}
          durationUnit={durationUnit}
          setDurationUnit={setDurationUnit}
          totalAmount={totalAmount}
          setTotalAmount={setTotalAmount}
          isEditing={!!contract}
        />

        {!contract && (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>أمثلة سريعة:</AlertTitle>
            <AlertDescription className="space-y-1 text-xs">
              <p>• عقد 3 سنوات بمبلغ 360,000 ر.س ← إيجار شهري: 10,000 ر.س</p>
              <p>• عقد 18 شهر بمبلغ 90,000 ر.س ← إيجار شهري: 5,000 ر.س</p>
              <p>• عقد سنوي بدفعة واحدة ← يُسجل كامل المبلغ عند الدفع</p>
            </AlertDescription>
          </Alert>
        )}

        {!contract && formData.property_id && (
          <ContractUnitsSelector
            units={units}
            selectedUnits={selectedUnits}
            onToggleUnit={toggleUnit}
            isLoading={unitsLoading}
          />
        )}

        <ContractRenewalOptions
          formData={formData}
          onUpdate={updateFormData}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button type="submit">
            {contract ? "تحديث" : "إضافة"}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
};
