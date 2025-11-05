import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";

const beneficiarySchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "الاسم يجب أن يكون أقل من 100 حرف" })
    .regex(/^[\u0600-\u06FF\s]+$/, { message: "الرجاء إدخال الاسم بالعربية فقط" }),
  
  idNumber: z
    .string()
    .trim()
    .length(10, { message: "رقم الهوية يجب أن يكون 10 أرقام" })
    .regex(/^[0-9]+$/, { message: "رقم الهوية يجب أن يحتوي على أرقام فقط" }),
  
  family: z
    .string()
    .trim()
    .min(3, { message: "اسم العائلة يجب أن يكون 3 أحرف على الأقل" })
    .max(100, { message: "اسم العائلة يجب أن يكون أقل من 100 حرف" }),
  
  category: z
    .string()
    .min(1, { message: "الرجاء اختيار فئة المستفيد" }),
  
  status: z
    .string()
    .min(1, { message: "الرجاء اختيار حالة المستفيد" }),
  
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
  
  address: z
    .string()
    .trim()
    .min(10, { message: "العنوان يجب أن يكون 10 أحرف على الأقل" })
    .max(500, { message: "العنوان يجب أن يكون أقل من 500 حرف" })
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
  id: number;
  name: string;
  idNumber: string;
  family: string;
  category: string;
  status: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface BeneficiaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary?: Beneficiary | null;
  onSave: (data: BeneficiaryFormData) => void;
}

const BeneficiaryDialog = ({
  open,
  onOpenChange,
  beneficiary,
  onSave,
}: BeneficiaryDialogProps) => {
  const { toast } = useToast();
  const isEditMode = !!beneficiary;

  const form = useForm<BeneficiaryFormData>({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: {
      name: "",
      idNumber: "",
      family: "",
      category: "",
      status: "نشط",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (beneficiary) {
      form.reset({
        name: beneficiary.name,
        idNumber: beneficiary.idNumber,
        family: beneficiary.family,
        category: beneficiary.category,
        status: beneficiary.status,
        phone: beneficiary.phone,
        email: beneficiary.email || "",
        address: beneficiary.address || "",
        notes: beneficiary.notes || "",
      });
    } else {
      form.reset({
        name: "",
        idNumber: "",
        family: "",
        category: "",
        status: "نشط",
        phone: "",
        email: "",
        address: "",
        notes: "",
      });
    }
  }, [beneficiary, form]);

  const onSubmit = (data: BeneficiaryFormData) => {
    try {
      onSave(data);
      toast({
        title: isEditMode ? "تم التحديث بنجاح" : "تمت الإضافة بنجاح",
        description: isEditMode
          ? "تم تحديث بيانات المستفيد بنجاح"
          : "تم إضافة المستفيد الجديد بنجاح",
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: "حدث خطأ",
        description: "حدث خطأ أثناء حفظ البيانات. الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient-primary">
            {isEditMode ? "تعديل بيانات المستفيد" : "إضافة مستفيد جديد"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "قم بتحديث بيانات المستفيد في النموذج أدناه"
              : "أدخل بيانات المستفيد الجديد في النموذج أدناه"}
          </DialogDescription>
        </DialogHeader>

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
                  name="name"
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
                  name="idNumber"
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
                  name="family"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        العائلة <span className="text-destructive">*</span>
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        الحالة <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-right">
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="نشط">نشط</SelectItem>
                          <SelectItem value="معلق">معلق</SelectItem>
                          <SelectItem value="موقوف">موقوف</SelectItem>
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      العنوان (اختياري)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="مثال: الرياض - حي السليمانية - شارع الملك فهد"
                        {...field}
                        className="text-right resize-none"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
      </DialogContent>
    </Dialog>
  );
};

export default BeneficiaryDialog;
