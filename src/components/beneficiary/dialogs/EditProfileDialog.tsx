/**
 * حوار تعديل الملف الشخصي للمستفيد
 * مع التحقق من البيانات وتسجيل التغييرات
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, User, Phone, CreditCard, Users, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Beneficiary = Database["public"]["Tables"]["beneficiaries"]["Row"];

// مخطط التحقق
const profileSchema = z.object({
  // معلومات التواصل
  phone: z.string().min(10, "رقم الهاتف يجب أن يكون 10 أرقام على الأقل").max(15),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  city: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  
  // المعلومات البنكية
  bank_name: z.string().max(100).optional(),
  bank_account_number: z.string().max(30).optional(),
  iban: z.string().max(34).regex(/^[A-Z]{2}[0-9A-Z]+$/, "صيغة IBAN غير صحيحة").optional().or(z.literal("")),
  
  // المعلومات العائلية
  marital_status: z.string().optional(),
  number_of_sons: z.coerce.number().min(0).max(50).optional(),
  number_of_daughters: z.coerce.number().min(0).max(50).optional(),
  number_of_wives: z.coerce.number().min(0).max(4).optional(),
  family_size: z.coerce.number().min(1).max(100).optional(),
  
  // معلومات إضافية
  housing_type: z.string().optional(),
  employment_status: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary;
  onSuccess?: () => void;
}

const MARITAL_STATUS_OPTIONS = [
  { value: "أعزب", label: "أعزب" },
  { value: "متزوج", label: "متزوج" },
  { value: "مطلق", label: "مطلق" },
  { value: "أرمل", label: "أرمل" },
];

const HOUSING_TYPE_OPTIONS = [
  { value: "ملك", label: "ملك" },
  { value: "إيجار", label: "إيجار" },
  { value: "مع الأهل", label: "مع الأهل" },
  { value: "أخرى", label: "أخرى" },
];

const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "موظف", label: "موظف" },
  { value: "متقاعد", label: "متقاعد" },
  { value: "عاطل", label: "عاطل عن العمل" },
  { value: "طالب", label: "طالب" },
  { value: "ربة منزل", label: "ربة منزل" },
  { value: "أعمال حرة", label: "أعمال حرة" },
];

export function EditProfileDialog({
  open,
  onOpenChange,
  beneficiary,
  onSuccess,
}: EditProfileDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      phone: beneficiary.phone || "",
      email: beneficiary.email || "",
      city: beneficiary.city || "",
      address: beneficiary.address || "",
      bank_name: beneficiary.bank_name || "",
      bank_account_number: beneficiary.bank_account_number || "",
      iban: beneficiary.iban || "",
      marital_status: beneficiary.marital_status || "",
      number_of_sons: beneficiary.number_of_sons || 0,
      number_of_daughters: beneficiary.number_of_daughters || 0,
      number_of_wives: beneficiary.number_of_wives || 0,
      family_size: beneficiary.family_size || 1,
      housing_type: beneficiary.housing_type || "",
      employment_status: beneficiary.employment_status || "",
      notes: beneficiary.notes || "",
    },
  });

  // تحديث القيم عند تغيير المستفيد
  useEffect(() => {
    if (beneficiary) {
      form.reset({
        phone: beneficiary.phone || "",
        email: beneficiary.email || "",
        city: beneficiary.city || "",
        address: beneficiary.address || "",
        bank_name: beneficiary.bank_name || "",
        bank_account_number: beneficiary.bank_account_number || "",
        iban: beneficiary.iban || "",
        marital_status: beneficiary.marital_status || "",
        number_of_sons: beneficiary.number_of_sons || 0,
        number_of_daughters: beneficiary.number_of_daughters || 0,
        number_of_wives: beneficiary.number_of_wives || 0,
        family_size: beneficiary.family_size || 1,
        housing_type: beneficiary.housing_type || "",
        employment_status: beneficiary.employment_status || "",
        notes: beneficiary.notes || "",
      });
    }
  }, [beneficiary, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);

    try {
      // تحديث البيانات
      const { error } = await supabase
        .from("beneficiaries")
        .update({
          phone: data.phone,
          email: data.email || null,
          city: data.city || null,
          address: data.address || null,
          bank_name: data.bank_name || null,
          bank_account_number: data.bank_account_number || null,
          iban: data.iban || null,
          marital_status: data.marital_status || null,
          number_of_sons: data.number_of_sons || 0,
          number_of_daughters: data.number_of_daughters || 0,
          number_of_wives: data.number_of_wives || 0,
          family_size: data.family_size || 1,
          housing_type: data.housing_type || null,
          employment_status: data.employment_status || null,
          notes: data.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", beneficiary.id);

      if (error) throw error;

      toast.success("تم تحديث الملف الشخصي بنجاح");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("فشل تحديث الملف الشخصي");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            تعديل الملف الشخصي
          </DialogTitle>
          <DialogDescription>
            قم بتحديث معلوماتك الشخصية. بعض الحقول للقراءة فقط ولا يمكن تعديلها.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="h-[60vh] pe-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="contact" className="gap-2">
                  <Phone className="h-4 w-4" />
                  التواصل
                </TabsTrigger>
                <TabsTrigger value="banking" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  البنكية
                </TabsTrigger>
                <TabsTrigger value="family" className="gap-2">
                  <Users className="h-4 w-4" />
                  العائلة
                </TabsTrigger>
              </TabsList>

              {/* معلومات التواصل */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">رقم الهاتف *</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="05xxxxxxxx"
                      dir="ltr"
                      className="text-left"
                    />
                    {form.formState.errors.phone && (
                      <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="example@email.com"
                      dir="ltr"
                      className="text-left"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">المدينة</Label>
                    <Input
                      id="city"
                      {...form.register("city")}
                      placeholder="الرياض"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">العنوان التفصيلي</Label>
                    <Textarea
                      id="address"
                      {...form.register("address")}
                      placeholder="الحي، الشارع، رقم المبنى"
                      rows={2}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* المعلومات البنكية */}
              <TabsContent value="banking" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bank_name">اسم البنك</Label>
                    <Input
                      id="bank_name"
                      {...form.register("bank_name")}
                      placeholder="البنك الأهلي"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bank_account_number">رقم الحساب</Label>
                    <Input
                      id="bank_account_number"
                      {...form.register("bank_account_number")}
                      placeholder="xxxxxxxxxx"
                      dir="ltr"
                      className="text-left font-mono"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="iban">رقم الآيبان (IBAN)</Label>
                    <Input
                      id="iban"
                      {...form.register("iban")}
                      placeholder="SA0000000000000000000000"
                      dir="ltr"
                      className="text-left font-mono"
                    />
                    {form.formState.errors.iban && (
                      <p className="text-sm text-destructive">{form.formState.errors.iban.message}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* المعلومات العائلية */}
              <TabsContent value="family" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marital_status">الحالة الاجتماعية</Label>
                    <Select
                      value={form.watch("marital_status")}
                      onValueChange={(value) => form.setValue("marital_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {MARITAL_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="family_size">حجم الأسرة</Label>
                    <Input
                      id="family_size"
                      type="number"
                      min={1}
                      max={100}
                      {...form.register("family_size")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number_of_sons">عدد الأبناء (ذكور)</Label>
                    <Input
                      id="number_of_sons"
                      type="number"
                      min={0}
                      max={50}
                      {...form.register("number_of_sons")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number_of_daughters">عدد البنات</Label>
                    <Input
                      id="number_of_daughters"
                      type="number"
                      min={0}
                      max={50}
                      {...form.register("number_of_daughters")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="number_of_wives">عدد الزوجات</Label>
                    <Input
                      id="number_of_wives"
                      type="number"
                      min={0}
                      max={4}
                      {...form.register("number_of_wives")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="housing_type">نوع السكن</Label>
                    <Select
                      value={form.watch("housing_type")}
                      onValueChange={(value) => form.setValue("housing_type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع السكن" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUSING_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employment_status">الحالة الوظيفية</Label>
                    <Select
                      value={form.watch("employment_status")}
                      onValueChange={(value) => form.setValue("employment_status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      {...form.register("notes")}
                      placeholder="أي معلومات إضافية تود إضافتها..."
                      rows={3}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
