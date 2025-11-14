import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
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

type Account = {
  id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  parent_id: string | null;
  account_type: string;
  account_nature: string;
  description: string | null;
  is_active: boolean;
  is_header: boolean;
};

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

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: Account | null;
  accounts: Account[];
};

const AddAccountDialog = ({ open, onOpenChange, account, accounts }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

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
        account_type: account.account_type as any,
        account_nature: account.account_nature as any,
        description: account.description || "",
        is_active: account.is_active,
        is_header: account.is_header,
      });
    } else {
      form.reset();
    }
  }, [account, form, open]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      setIsSubmitting(true);
      
      // التحقق من عدم تكرار رمز الحساب
      if (!account || (account && account.code !== data.code)) {
        const { data: existingAccount } = await supabase
          .from("accounts")
          .select("id")
          .eq("code", data.code)
          .maybeSingle();

        if (existingAccount) {
          throw new Error("رمز الحساب موجود مسبقاً. يرجى اختيار رمز آخر.");
        }
      }

      const accountData = {
        code: data.code,
        name_ar: data.name_ar,
        name_en: data.name_en || null,
        parent_id: data.parent_id || null,
        account_type: data.account_type,
        account_nature: data.account_nature,
        description: data.description || null,
        is_active: data.is_active,
        is_header: data.is_header,
      };

      let result;
      if (account) {
        result = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", account.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("accounts")
          .insert([accountData])
          .select()
          .single();
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(account ? "تم تحديث الحساب بنجاح" : "تم إضافة الحساب بنجاح");
      onOpenChange(false);
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ الحساب");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
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
