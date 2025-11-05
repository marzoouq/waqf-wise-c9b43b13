import { z } from "zod";
import { VALIDATION } from "./constants";

// Common validation rules
export const commonValidation = {
  requiredString: (message: string) => 
    z.string().min(1, { message }),
  
  optionalString: () => 
    z.string().optional(),
  
  phone: () =>
    z.string()
      .min(VALIDATION.PHONE_MIN_LENGTH, { message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل" })
      .regex(/^[0-9+]+$/, { message: "رقم الهاتف يجب أن يحتوي على أرقام فقط" }),
  
  nationalId: () =>
    z.string()
      .length(VALIDATION.NATIONAL_ID_LENGTH, { message: "رقم الهوية يجب أن يكون 10 أرقام" })
      .regex(/^[0-9]+$/, { message: "رقم الهوية يجب أن يحتوي على أرقام فقط" }),
  
  email: () =>
    z.string().email({ message: "البريد الإلكتروني غير صحيح" }).optional(),
  
  amount: (message: string = "المبلغ مطلوب") =>
    z.number()
      .min(VALIDATION.MIN_AMOUNT, { message: "المبلغ يجب أن يكون أكبر من صفر" })
      .max(VALIDATION.MAX_AMOUNT, { message: "المبلغ كبير جداً" }),
  
  percentage: () =>
    z.number()
      .min(VALIDATION.MIN_PERCENTAGE, { message: "النسبة لا يمكن أن تكون سالبة" })
      .max(VALIDATION.MAX_PERCENTAGE, { message: "النسبة لا يمكن أن تتجاوز 100%" }),
  
  date: (message: string) =>
    z.date({ required_error: message }),
  
  positiveInteger: (message: string) =>
    z.number().int().positive({ message }),
};

// Beneficiary Schema
export const beneficiarySchema = z.object({
  full_name: commonValidation.requiredString("الاسم الكامل مطلوب"),
  national_id: commonValidation.nationalId(),
  phone: commonValidation.phone(),
  email: commonValidation.email(),
  family_name: commonValidation.optionalString(),
  relationship: commonValidation.optionalString(),
  category: commonValidation.requiredString("الفئة مطلوبة"),
  status: commonValidation.requiredString("الحالة مطلوبة"),
  notes: commonValidation.optionalString(),
});

// Property Schema
export const propertySchema = z.object({
  name: commonValidation.requiredString("اسم العقار مطلوب"),
  type: commonValidation.requiredString("نوع العقار مطلوب"),
  location: commonValidation.requiredString("موقع العقار مطلوب"),
  units: commonValidation.positiveInteger("عدد الوحدات يجب أن يكون أكبر من صفر"),
  occupied: z.number().int().min(0, { message: "عدد الوحدات المؤجرة لا يمكن أن يكون سالباً" }),
  monthly_revenue: commonValidation.amount("الإيرادات الشهرية مطلوبة"),
  status: commonValidation.requiredString("حالة العقار مطلوبة"),
  description: commonValidation.optionalString(),
}).refine((data) => data.occupied <= data.units, {
  message: "عدد الوحدات المؤجرة لا يمكن أن يتجاوز إجمالي الوحدات",
  path: ["occupied"],
});

// Payment Schema
export const paymentSchema = z.object({
  payment_type: z.enum(["receipt", "payment"], {
    required_error: "نوع السند مطلوب",
  }),
  payment_number: commonValidation.requiredString("رقم السند مطلوب"),
  payment_date: commonValidation.date("تاريخ السند مطلوب"),
  amount: commonValidation.amount("المبلغ مطلوب"),
  payment_method: z.enum(["cash", "bank_transfer", "cheque", "card"], {
    required_error: "طريقة الدفع مطلوبة",
  }),
  payer_name: commonValidation.requiredString("اسم الدافع مطلوب"),
  reference_number: commonValidation.optionalString(),
  description: commonValidation.requiredString("البيان مطلوب"),
  notes: commonValidation.optionalString(),
});

// Distribution Schema
export const distributionSchema = z.object({
  month: commonValidation.requiredString("الشهر مطلوب"),
  total_amount: commonValidation.amount("إجمالي المبلغ مطلوب"),
  beneficiaries_count: commonValidation.positiveInteger("عدد المستفيدين يجب أن يكون أكبر من صفر"),
  distribution_date: commonValidation.date("تاريخ التوزيع مطلوب"),
  notes: commonValidation.optionalString(),
});

// Simulation Schema
export const simulationSchema = z.object({
  availableAmount: commonValidation.amount("المبلغ المتاح مطلوب"),
  beneficiaries: commonValidation.positiveInteger("عدد المستفيدين مطلوب"),
  maintenanceFund: commonValidation.percentage(),
  reserveFund: commonValidation.percentage(),
});

// Profile Schema
export const profileSchema = z.object({
  fullName: commonValidation.requiredString("الاسم الكامل مطلوب"),
  email: z.string().email({ message: "البريد الإلكتروني غير صحيح" }),
  phone: commonValidation.phone(),
  position: commonValidation.requiredString("المسمى الوظيفي مطلوب"),
});

// Upload Document Schema
export const uploadDocumentSchema = z.object({
  name: commonValidation.requiredString("اسم المستند مطلوب"),
  category: commonValidation.requiredString("الفئة مطلوبة"),
  description: commonValidation.optionalString(),
});

// Create Folder Schema
export const createFolderSchema = z.object({
  name: commonValidation.requiredString("اسم المجلد مطلوب"),
  description: commonValidation.optionalString(),
});

export type BeneficiaryFormValues = z.infer<typeof beneficiarySchema>;
export type PropertyFormValues = z.infer<typeof propertySchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type DistributionFormValues = z.infer<typeof distributionSchema>;
export type SimulationFormValues = z.infer<typeof simulationSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export type UploadDocumentFormValues = z.infer<typeof uploadDocumentSchema>;
export type CreateFolderFormValues = z.infer<typeof createFolderSchema>;
