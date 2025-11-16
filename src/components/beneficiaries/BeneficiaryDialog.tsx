import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Database } from "@/integrations/supabase/types";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const beneficiarySchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "الاسم يجب أن يكون أقل من 100 حرف" })
    .regex(/^[\u0600-\u06FF\s]+$/, { message: "الرجاء إدخال الاسم بالعربية فقط" }),
  
  nationalId: z
    .string()
    .trim()
    .length(10, { message: "رقم الهوية يجب أن يكون 10 أرقام" })
    .regex(/^[0-9]+$/, { message: "رقم الهوية يجب أن يحتوي على أرقام فقط" }),
  
  familyName: z
    .string()
    .trim()
    .min(3, { message: "اسم العائلة يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "اسم العائلة يجب أن يكون أقل من 100 حرف" })
    .optional()
    .or(z.literal("")),
  
  category: z
    .string()
    .min(1, { message: "الرجاء اختيار فئة المستفيد" }),
  
  relationship: z
    .string()
    .optional()
    .or(z.literal("")),
  
  phone: z
    .string()
    .trim()
    .regex(/^(05|5)[0-9]{8}$/, { message: "رقم الهاتف يجب أن يبدأ بـ 05 ويتكون من 10 أرقام" }),
  
  email: z
    .string()
    .trim()
    .email({ message: "البريد الإلكتروني غير صحيح" })
    .max(255, { message: "البريد الإلكتروني يجب أن يكون أقل من 255 حرف" })
    .optional()
    .or(z.literal("")),
  
  numberOfSons: z
    .number()
    .int()
    .min(0, { message: "عدد الأبناء لا يمكن أن يكون سالباً" })
    .optional()
    .default(0),
  
  numberOfDaughters: z
    .number()
    .int()
    .min(0, { message: "عدد البنات لا يمكن أن يكون سالباً" })
    .optional()
    .default(0),
  
  numberOfWives: z
    .number()
    .int()
    .min(0, { message: "عدد الزوجات لا يمكن أن يكون سالباً" })
    .max(4, { message: "عدد الزوجات لا يمكن أن يتجاوز 4" })
    .optional()
    .default(0),
  
  employmentStatus: z
    .string()
    .optional()
    .or(z.literal("")),
  
  housingType: z
    .string()
    .optional()
    .or(z.literal("")),
  
  notes: z
    .string()
    .trim()
    .max(1000, { message: "الملاحظات يجب أن تكون أقل من 1000 حرف" })
    .optional()
    .or(z.literal("")),
});

type BeneficiaryFormData = z.infer<typeof beneficiarySchema>;

interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  family_name?: string;
  category: string;
  relationship?: string;
  phone: string;
  email?: string;
  number_of_sons?: number;
  number_of_daughters?: number;
  number_of_wives?: number;
  employment_status?: string;
  housing_type?: string;
  notes?: string;
}

interface BeneficiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary?: Beneficiary | null;
  onSave: (data: Database['public']['Tables']['beneficiaries']['Insert']) => void;
}

const BeneficiaryDialog = ({
  open,
  onOpenChange,
  beneficiary,
  onSave,
}: BeneficiaryDialogProps) => {
  const isEditMode = !!beneficiary;

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      fullName: "",
      nationalId: "",
      familyName: "",
      category: "",
      relationship: "",
      phone: "",
      email: "",
      numberOfSons: 0,
      numberOfDaughters: 0,
      numberOfWives: 0,
      employmentStatus: "",
      housingType: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (beneficiary) {
      form.reset({
        fullName: beneficiary.full_name,
        nationalId: beneficiary.national_id,
        familyName: beneficiary.family_name || "",
        category: beneficiary.category,
        relationship: beneficiary.relationship || "",
        phone: beneficiary.phone,
        email: beneficiary.email || "",
        numberOfSons: beneficiary.number_of_sons || 0,
        numberOfDaughters: beneficiary.number_of_daughters || 0,
        numberOfWives: beneficiary.number_of_wives || 0,
        employmentStatus: beneficiary.employment_status || "",
        housingType: beneficiary.housing_type || "",
        notes: beneficiary.notes || "",
      });
    } else {
      form.reset({
        fullName: "",
        nationalId: "",
        familyName: "",
        category: "",
        relationship: "",
        phone: "",
        email: "",
        numberOfSons: 0,
        numberOfDaughters: 0,
        numberOfWives: 0,
        employmentStatus: "",
        housingType: "",
        notes: "",
      });
    }
  }, [beneficiary, form]);

  const onSubmit = async (data: BeneficiaryFormData) => {
    const dbData = {
      full_name: data.fullName,
      national_id: data.nationalId,
      phone: data.phone,
      email: data.email || null,
      category: data.category,
      family_name: data.familyName || null,
      relationship: data.relationship || null,
      number_of_sons: data.numberOfSons || 0,
      number_of_daughters: data.numberOfDaughters || 0,
      number_of_wives: data.numberOfWives || 0,
      employment_status: data.employmentStatus || null,
      housing_type: data.housingType || null,
      status: "نشط",
      notes: data.notes || null,
    };
    
    await onSave(dbData);
    onOpenChange(false);
    form.reset();
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={isEditMode ? "تعديل بيانات المستفيد" : "إضافة مستفيد جديد"}
      description={isEditMode ? "قم بتحديث بيانات المستفيد في النموذج أدناه" : "أدخل بيانات المستفيد الجديد في النموذج أدناه"}
      size="xl"
    >

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-r-4 border-r-primary pr-3">
                المعلومات الشخصية
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        الاسم الكامل <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: أحمد محمد العلي"
                          {...field}
                          className="text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        رقم الهوية <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: 1234567890"
                          {...field}
                          className="text-right font-mono"
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="familyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        العائلة
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: عائلة العلي"
                          {...field}
                          className="text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        رقم الهاتف <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: 0501234567"
                          {...field}
                          className="text-right font-mono"
                          maxLength={10}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      البريد الإلكتروني (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="مثال: example@email.com"
                        {...field}
                        className="text-right"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Classification Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-r-4 border-r-accent pr-3">
                التصنيف والحالة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        فئة المستفيد <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="الفئة الأولى">الفئة الأولى</SelectItem>
                          <SelectItem value="الفئة الثانية">الفئة الثانية</SelectItem>
                          <SelectItem value="الفئة الثالثة">الفئة الثالثة</SelectItem>
                          <SelectItem value="الفئة الرابعة">الفئة الرابعة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        صلة القرابة
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="مثال: ابن، زوجة، أخ"
                          {...field}
                          className="text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Family Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-r-4 border-r-secondary pr-3">
                معلومات العائلة
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="numberOfSons"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        عدد الأبناء
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfDaughters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        عدد البنات
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numberOfWives"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        عدد الزوجات
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="4"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="text-right"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Employment & Housing Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-r-4 border-r-warning pr-3">
                معلومات الوظيفة والسكن
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="employmentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        الحالة الوظيفية
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="اختر الحالة الوظيفية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="موظف">موظف</SelectItem>
                          <SelectItem value="غير موظف">غير موظف</SelectItem>
                          <SelectItem value="متقاعد">متقاعد</SelectItem>
                          <SelectItem value="طالب">طالب</SelectItem>
                          <SelectItem value="أعمال حرة">أعمال حرة</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="housingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        نوع السكن
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="اختر نوع السكن" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ملك">ملك</SelectItem>
                          <SelectItem value="إيجار">إيجار</SelectItem>
                          <SelectItem value="سكن حكومي">سكن حكومي</SelectItem>
                          <SelectItem value="مع العائلة">مع العائلة</SelectItem>
                          <SelectItem value="آخر">آخر</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-r-4 border-r-success pr-3">
                معلومات إضافية
              </h3>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      ملاحظات (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أي ملاحظات إضافية عن المستفيد..."
                        {...field}
                        className="text-right resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary-hover"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "جاري الحفظ..."
                  : isEditMode
                  ? "حفظ التعديلات"
                  : "إضافة المستفيد"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

export default BeneficiaryDialog;
