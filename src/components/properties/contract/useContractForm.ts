import { useState, useEffect, useCallback, useRef } from "react";
import { Contract } from "@/hooks/property/useContracts";

export interface ContractFormData {
  contract_number: string;
  property_id: string;
  tenant_id: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_id_number: string;
  tenant_email: string;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent: string;
  security_deposit: string;
  payment_frequency: string;
  is_renewable: boolean;
  auto_renew: boolean;
  renewal_notice_days: string;
  terms_and_conditions: string;
  notes: string;
  // حقول الضريبة
  tax_percentage: string;
  is_tax_exempt: boolean;
}

const generateContractNumber = () => {
  const date = new Date();
  return `C-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
};

const getInitialFormData = (): ContractFormData => ({
  contract_number: generateContractNumber(),
  property_id: "",
  tenant_id: "",
  tenant_name: "",
  tenant_phone: "",
  tenant_id_number: "",
  tenant_email: "",
  contract_type: "إيجار",
  start_date: "",
  end_date: "",
  monthly_rent: "",
  security_deposit: "",
  payment_frequency: "شهري",
  is_renewable: true,
  auto_renew: false,
  renewal_notice_days: "60",
  terms_and_conditions: "",
  notes: "",
  // الضريبة - افتراضي معفي
  tax_percentage: "0",
  is_tax_exempt: true,
});

export function useContractForm(contract?: Contract | null) {
  const [formData, setFormData] = useState<ContractFormData>(getInitialFormData);
  const [contractDuration, setContractDuration] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<'سنوات' | 'أشهر'>('سنوات');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

  // منع إعادة الحساب المتكررة
  const prevCalcInputs = useRef<string>('');

  // حساب تلقائي للتفاصيل - بدون تبعيات على formData
  useEffect(() => {
    // تخطي الحساب في وضع التعديل
    if (contract) return;
    
    // التحقق من وجود جميع المدخلات
    const startDateValue = formData.start_date;
    if (!startDateValue || !totalAmount || !contractDuration) return;
    
    // إنشاء مفتاح للمدخلات الحالية
    const inputsKey = `${startDateValue}-${totalAmount}-${contractDuration}-${durationUnit}`;
    
    // تخطي إذا لم تتغير المدخلات
    if (prevCalcInputs.current === inputsKey) return;
    prevCalcInputs.current = inputsKey;
    
    const startDate = new Date(startDateValue);
    const durationInMonths = durationUnit === 'سنوات' ? contractDuration * 12 : contractDuration;
    
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + durationInMonths);
    
    const monthlyRent = parseFloat(totalAmount) / durationInMonths;
    
    const newEndDate = endDate.toISOString().split('T')[0];
    const newMonthlyRent = monthlyRent.toFixed(2);
    
    setFormData(prev => ({
      ...prev,
      end_date: newEndDate,
      monthly_rent: newMonthlyRent,
    }));
  }, [contract, formData.start_date, totalAmount, contractDuration, durationUnit]);

  // تعبئة البيانات عند التعديل فقط
  useEffect(() => {
    if (contract) {
      const taxPct = (contract as { tax_percentage?: number }).tax_percentage || 0;
      setFormData({
        contract_number: contract.contract_number,
        property_id: contract.property_id,
        tenant_id: (contract as { tenant_id?: string }).tenant_id || "",
        tenant_name: contract.tenant_name,
        tenant_phone: contract.tenant_phone,
        tenant_id_number: contract.tenant_id_number,
        tenant_email: contract.tenant_email || "",
        contract_type: contract.contract_type,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent.toString(),
        security_deposit: contract.security_deposit?.toString() || "",
        payment_frequency: contract.payment_frequency,
        is_renewable: contract.is_renewable,
        auto_renew: contract.auto_renew,
        renewal_notice_days: contract.renewal_notice_days.toString(),
        terms_and_conditions: contract.terms_and_conditions || "",
        notes: contract.notes || "",
        tax_percentage: taxPct.toString(),
        is_tax_exempt: taxPct === 0,
      });
      setSelectedPropertyId(contract.property_id);
      
      // حساب المدة والمبلغ الإجمالي
      const start = new Date(contract.start_date);
      const end = new Date(contract.end_date);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      const years = Math.floor(months / 12);
      
      if (years > 0 && months % 12 === 0) {
        setContractDuration(years);
        setDurationUnit('سنوات');
      } else {
        setContractDuration(months);
        setDurationUnit('أشهر');
      }
      
      setTotalAmount((contract.monthly_rent * months).toString());
    }
    // لا نعيد تهيئة النموذج هنا - التهيئة تتم في useState فقط
  }, [contract]);

  const updateFormData = useCallback((updates: Partial<ContractFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setSelectedUnits([]);
    setSelectedPropertyId("");
    setContractDuration(1);
    setDurationUnit('سنوات');
    setTotalAmount('');
    prevCalcInputs.current = ''; // إعادة تعيين مفتاح الحساب
  }, []);

  const toggleUnit = useCallback((unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  }, []);

  return {
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
  };
}
