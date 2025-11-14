import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ResponsiveDialog, DialogFooter } from "@/components/shared/ResponsiveDialog";
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
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";

const profileSchema = z.object({
  fullName: z
    .string()
    .min(3, { message: "الاسم الكامل يجب أن يكون 3 أحرف على الأقل" })
    .regex(/^[\u0600-\u06FF\s]+$/, {
      message: "الاسم يجب أن يحتوي على أحرف عربية فقط",
    }),
  email: z.string().email({ message: "البريد الإلكتروني غير صالح" }),
  phone: z
    .string()
    .regex(/^05\d{8}$/, {
      message: "رقم الجوال يجب أن يكون بالصيغة 05XXXXXXXX",
    }),
  position: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { profile, isLoading, upsertProfile } = useProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      position: profile?.position || "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        position: profile.position || "",
      });
    }
  }, [profile, form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await upsertProfile({
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        position: values.position,
      });
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="الملف الشخصي"
      description="قم بتحديث معلومات حسابك الشخصي"
      size="md"
    >
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل *</FormLabel>
                  <FormControl>
                    <Input placeholder="محمد أحمد العلي" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="example@domain.com" {...field} />
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
                  <FormLabel>رقم الجوال *</FormLabel>
                  <FormControl>
                    <Input placeholder="05XXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المنصب</FormLabel>
                  <FormControl>
                    <Input placeholder="مدير النظام" {...field} />
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
              <Button type="submit">حفظ التعديلات</Button>
            </DialogFooter>
          </form>
        </Form>
    </ResponsiveDialog>
  );
}
