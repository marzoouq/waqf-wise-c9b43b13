import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { useAddAccount } from "@/hooks/accounting";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { AccountRow } from "@/types/supabase-helpers";

const accountSchema = z.object({
  code: z.string()
    .min(1, { message: "رمز الحساب مطلوب" })
    .max(20, { message: "رمز الحساب يجب ألا يزيد عن 20 حرف" })
    .regex(/^[0-9]+$/, { message: "رمز الحساب يجب أن يحتوي على أرقام فقط" }),
  name_ar: z.string()
    .min(3, { message: "الاسم العربي يجب ألا يقل عن 3 حروف" })
    .max(200, { message: "الاسم العربي يجب ألا يزيد عن 200 حرف" }),
  name_en: z.string().optional(),
  parent_id: z.string().optional(),
  account_type: z.enum(['asset', 'liability', 'equity', 'revenue', 'expense'], {
    message: "نوع الحساب مطلوب"
  }),
  account_nature: z.enum(['debit', 'credit'], {
    message: "طبيعة الحساب مطلوبة"
  }),
  is_active: z.boolean(),
  is_header: z.boolean(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof accountSchema>;

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: AccountRow | null;
  accounts: AccountRow[];
}

const AddAccountDialog = ({ open, onOpenChange, account, accounts }: AddAccountDialogProps) => {
  const { isSubmitting, mutate } = useAddAccount(() => {
    onOpenChange(false);
    form.reset();
  });

  const form = useForm<FormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      code: "",
      name_ar: "",
      name_en: "",
      parent_id: undefined,
      account_type: "asset",
      account_nature: "debit",
      description: "",
      is_active: true,
      is_header: false,
    },
  });

  useEffect(() => {
    if (account) {
      form.reset({
        code: account.code,
        name_ar: account.name_ar,
        name_en: account.name_en || "",
        parent_id: account.parent_id || undefined,
        account_type: account.account_type,
        account_nature: account.account_nature,
        description: account.description || "",
        is_active: account.is_active,
        is_header: account.is_header,
      });
    } else {
      form.reset();
    }
  }, [account, form, open]);

  const onSubmit = (data: FormData) => {
    mutate({ 
      data: {
        code: data.code,
        name_ar: data.name_ar,
        name_en: data.name_en,
        parent_id: data.parent_id,
        account_type: data.account_type,
        account_nature: data.account_nature,
        is_active: data.is_active,
        is_header: data.is_header,
        description: data.description,
      }, 
      existingAccount: account 
    });
  };

  return (
    <ResponsiveDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={account ? "تعديل حساب" : "إضافة حساب جديد"}
      size="lg"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز الحساب <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="مثال: 1010" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name_ar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم العربي <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="اسم الحساب" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الإنجليزي (اختياري)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Account Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الحساب الأب</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "none" ? undefined : value)} 
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="لا يوجد (حساب رئيسي)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد (حساب رئيسي)</SelectItem>
                      {accounts
                        ?.filter(
                          (acc) => acc.is_header && (!account || acc.id !== account.id)
                        )
                        .map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name_ar}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="account_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الحساب <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="asset">أصول</SelectItem>
                      <SelectItem value="liability">خصوم</SelectItem>
                      <SelectItem value="equity">حقوق ملكية</SelectItem>
                      <SelectItem value="revenue">إيرادات</SelectItem>
                      <SelectItem value="expense">مصروفات</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="account_nature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>طبيعة الحساب <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="debit">مدين</SelectItem>
                      <SelectItem value="credit">دائن</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الوصف (اختياري)</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-x-reverse">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">حساب نشط</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_header"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-x-reverse">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">حساب رئيسي (يحتوي على حسابات فرعية)</FormLabel>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : account ? "حفظ التعديلات" : "إضافة"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveDialog>
  );
};

export default AddAccountDialog;
