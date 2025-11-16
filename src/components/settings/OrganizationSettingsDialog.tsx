import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrganizationSettings } from "@/hooks/useOrganizationSettings";
import { Building2, Loader2 } from "lucide-react";

const organizationSchema = z.object({
  organization_name_ar: z.string().min(1, "اسم المنشأة بالعربية مطلوب"),
  organization_name_en: z.string().optional(),
  vat_registration_number: z
    .string()
    .regex(/^3\d{14}$/, "الرقم الضريبي يجب أن يتكون من 15 رقم ويبدأ بـ 3"),
  commercial_registration_number: z.string().min(1, "رقم السجل التجاري مطلوب"),
  address_ar: z.string().min(1, "العنوان بالعربية مطلوب"),
  address_en: z.string().optional(),
  city: z.string().min(1, "المدينة مطلوبة"),
  postal_code: z.string().optional(),
  country: z.string().default("المملكة العربية السعودية"),
  phone: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صحيح").optional().or(z.literal("")),
  logo_url: z.string().optional(),
  
  governance_type: z.enum(['nazer_only', 'nazer_with_board']).default('nazer_only'),
  nazer_name: z.string().optional(),
  nazer_title: z.string().optional(),
  nazer_appointment_date: z.string().optional(),
  nazer_contact_phone: z.string().optional(),
  nazer_contact_email: z.string().email().optional().or(z.literal("")),
  waqf_type: z.enum(['ذري', 'خيري', 'مشترك']).optional(),
  waqf_establishment_date: z.string().optional(),
  waqf_registration_number: z.string().optional(),
  waqf_deed_url: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function OrganizationSettingsDialog({
  open,
  onOpenChange,
}: OrganizationSettingsDialogProps) {
  const { settings, saveSettings, isSaving } = useOrganizationSettings();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organization_name_ar: settings?.organization_name_ar || "",
      organization_name_en: settings?.organization_name_en || "",
      vat_registration_number: settings?.vat_registration_number || "",
      commercial_registration_number: settings?.commercial_registration_number || "",
      address_ar: settings?.address_ar || "",
      address_en: settings?.address_en || "",
      city: settings?.city || "",
      postal_code: settings?.postal_code || "",
      country: settings?.country || "المملكة العربية السعودية",
      phone: settings?.phone || "",
      email: settings?.email || "",
      logo_url: settings?.logo_url || "",
    },
    values: settings
      ? {
          organization_name_ar: settings.organization_name_ar,
          organization_name_en: settings.organization_name_en || "",
          vat_registration_number: settings.vat_registration_number,
          commercial_registration_number: settings.commercial_registration_number,
          address_ar: settings.address_ar,
          address_en: settings.address_en || "",
          city: settings.city,
          postal_code: settings.postal_code || "",
          country: settings.country,
          phone: settings.phone || "",
          email: settings.email || "",
          logo_url: settings.logo_url || "",
        }
      : undefined,
  });

  const onSubmit = async (values: OrganizationFormData) => {
    const settingsData = {
      organization_name_ar: values.organization_name_ar,
      organization_name_en: values.organization_name_en || null,
      vat_registration_number: values.vat_registration_number,
      commercial_registration_number: values.commercial_registration_number,
      address_ar: values.address_ar,
      address_en: values.address_en || null,
      city: values.city,
      postal_code: values.postal_code || null,
      country: values.country,
      phone: values.phone || null,
      email: values.email || null,
      logo_url: values.logo_url || null,
    };
    await saveSettings(settingsData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            إعدادات المنشأة
          </DialogTitle>
          <DialogDescription>
            أدخل معلومات المنشأة للظهور في الفواتير الضريبية
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* اسم المنشأة بالعربية */}
              <FormField
                control={form.control}
                name="organization_name_ar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنشأة (عربي) *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="مؤسسة الوقف الخيري" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* اسم المنشأة بالإنجليزية */}
              <FormField
                control={form.control}
                name="organization_name_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنشأة (إنجليزي)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Waqf Charity Foundation" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الرقم الضريبي */}
              <FormField
                control={form.control}
                name="vat_registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرقم الضريبي *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="300000000000003"
                        maxLength={15}
                      />
                    </FormControl>
                    <FormDescription>15 رقم يبدأ بـ 3</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* رقم السجل التجاري */}
              <FormField
                control={form.control}
                name="commercial_registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم السجل التجاري *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* المدينة */}
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدينة *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="الرياض" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الرمز البريدي */}
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرمز البريدي</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* الهاتف */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الهاتف</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+966 11 234 5678" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* البريد الإلكتروني */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="info@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* العنوان بالعربية */}
            <FormField
              control={form.control}
              name="address_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان (عربي) *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="شارع الملك فهد، حي العليا"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* العنوان بالإنجليزية */}
            <FormField
              control={form.control}
              name="address_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان (إنجليزي)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="King Fahd Road, Al Olaya District"
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ الإعدادات
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
