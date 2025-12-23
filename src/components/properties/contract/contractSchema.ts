import { z } from 'zod';

// توليد رقم العقد تلقائياً
export const generateContractNumber = () => {
  const date = new Date();
  return `C-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
};

// مخطط التحقق للعقد
export const contractSchema = z.object({
  contract_number: z.string(),
  property_id: z.string().min(1, "العقار مطلوب"),
  tenant_id: z.string().optional(),
  tenant_name: z.string().min(3, "اسم المستأجر مطلوب (3 أحرف على الأقل)"),
  tenant_phone: z.string().min(10, "رقم الجوال مطلوب (10 أرقام على الأقل)"),
  tenant_id_number: z.string().min(10, "رقم الهوية مطلوب (10 أرقام على الأقل)"),
  tenant_email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal('')),
  contract_type: z.string().default("إيجار"),
  start_date: z.string().min(1, "تاريخ البداية مطلوب"),
  duration_value: z.coerce.number().min(1, "مدة العقد مطلوبة"),
  duration_unit: z.enum(['سنوات', 'أشهر']).default('سنوات'),
  total_amount: z.coerce.number().min(1, "المبلغ الإجمالي مطلوب"),
  payment_frequency: z.string().default("شهري"),
  security_deposit: z.coerce.number().optional().default(0),
  unit_ids: z.array(z.string()).min(1, "اختر وحدة واحدة على الأقل"),
  is_renewable: z.boolean().default(true),
  auto_renew: z.boolean().default(false),
  renewal_notice_days: z.coerce.number().default(60),
  is_tax_exempt: z.boolean().default(true),
  tax_percentage: z.coerce.number().default(0),
  terms_and_conditions: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type ContractFormValues = z.infer<typeof contractSchema>;

// القيم الافتراضية للنموذج
export const getDefaultValues = (): ContractFormValues => ({
  contract_number: generateContractNumber(),
  property_id: "",
  tenant_id: "",
  tenant_name: "",
  tenant_phone: "",
  tenant_id_number: "",
  tenant_email: "",
  contract_type: "إيجار",
  start_date: "",
  duration_value: 1,
  duration_unit: 'سنوات',
  total_amount: 0,
  payment_frequency: "شهري",
  security_deposit: 0,
  unit_ids: [],
  is_renewable: true,
  auto_renew: false,
  renewal_notice_days: 60,
  is_tax_exempt: true,
  tax_percentage: 0,
  terms_and_conditions: "",
  notes: "",
});

// تحويل عقد موجود إلى قيم النموذج
export const contractToFormValues = (contract: {
  contract_number: string;
  property_id: string;
  tenant_id?: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_id_number: string;
  tenant_email?: string | null;
  contract_type: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  security_deposit?: number | null;
  payment_frequency: string;
  is_renewable: boolean;
  auto_renew: boolean;
  renewal_notice_days: number;
  terms_and_conditions?: string | null;
  notes?: string | null;
  tax_percentage?: number;
}): ContractFormValues => {
  // حساب المدة والوحدة من التواريخ
  const start = new Date(contract.start_date);
  const end = new Date(contract.end_date);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  
  const durationUnit: 'سنوات' | 'أشهر' = (years > 0 && months % 12 === 0) ? 'سنوات' : 'أشهر';
  const durationValue = durationUnit === 'سنوات' ? years : months;
  const totalAmount = contract.monthly_rent * months;
  
  return {
    contract_number: contract.contract_number,
    property_id: contract.property_id,
    tenant_id: contract.tenant_id || "",
    tenant_name: contract.tenant_name,
    tenant_phone: contract.tenant_phone,
    tenant_id_number: contract.tenant_id_number,
    tenant_email: contract.tenant_email || "",
    contract_type: contract.contract_type,
    start_date: contract.start_date,
    duration_value: durationValue,
    duration_unit: durationUnit,
    total_amount: totalAmount,
    payment_frequency: contract.payment_frequency,
    security_deposit: contract.security_deposit || 0,
    unit_ids: [], // لا تحتاج للوحدات عند التعديل
    is_renewable: contract.is_renewable,
    auto_renew: contract.auto_renew,
    renewal_notice_days: contract.renewal_notice_days,
    is_tax_exempt: (contract.tax_percentage || 0) === 0,
    tax_percentage: contract.tax_percentage || 0,
    terms_and_conditions: contract.terms_and_conditions || "",
    notes: contract.notes || "",
  };
};
