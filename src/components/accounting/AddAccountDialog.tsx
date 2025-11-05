import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

type Account = {
  id: string;
  code: string;
  name_ar: string;
  name_en: string | null;
  parent_id: string | null;
  account_type: string;
  account_nature: string;
  is_active: boolean;
  is_header: boolean;
};

type FormData = {
  code: string;
  name_ar: string;
  name_en: string;
  parent_id: string;
  account_type: string;
  account_nature: string;
  is_active: boolean;
  is_header: boolean;
  description: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  accounts: Account[];
};

const AddAccountDialog = ({ open, onOpenChange, account, accounts }: Props) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      is_active: true,
      is_header: false,
    },
  });

  useEffect(() => {
    if (account) {
      setValue("code", account.code);
      setValue("name_ar", account.name_ar);
      setValue("name_en", account.name_en || "");
      setValue("parent_id", account.parent_id || "");
      setValue("account_type", account.account_type);
      setValue("account_nature", account.account_nature);
      setValue("is_active", account.is_active);
      setValue("is_header", account.is_header);
    } else {
      reset();
    }
  }, [account, setValue, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const accountData = {
        code: data.code,
        name_ar: data.name_ar,
        name_en: data.name_en || null,
        parent_id: data.parent_id || null,
        account_type: data.account_type as "asset" | "liability" | "equity" | "revenue" | "expense",
        account_nature: data.account_nature as "debit" | "credit",
        is_active: data.is_active,
        is_header: data.is_header,
        description: data.description || null,
      };

      if (account) {
        const { error } = await supabase
          .from("accounts")
          .update(accountData)
          .eq("id", account.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("accounts")
          .insert([accountData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(account ? "تم تحديث الحساب بنجاح" : "تم إضافة الحساب بنجاح");
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error("حدث خطأ: " + error.message);
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? "تعديل حساب" : "إضافة حساب جديد"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">رمز الحساب *</Label>
              <Input
                id="code"
                {...register("code", { required: true })}
                placeholder="مثال: 111"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent_id">الحساب الأب</Label>
              <Select
                value={watch("parent_id")}
                onValueChange={(value) => setValue("parent_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحساب الأب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">بدون حساب أب</SelectItem>
                  {accounts
                    .filter((a) => a.is_header && a.id !== account?.id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} - {a.name_ar}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_ar">اسم الحساب (عربي) *</Label>
            <Input
              id="name_ar"
              {...register("name_ar", { required: true })}
              placeholder="مثال: النقدية"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name_en">اسم الحساب (إنجليزي)</Label>
            <Input
              id="name_en"
              {...register("name_en")}
              placeholder="Example: Cash"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="account_type">نوع الحساب *</Label>
              <Select
                value={watch("account_type")}
                onValueChange={(value) => setValue("account_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asset">أصول</SelectItem>
                  <SelectItem value="liability">خصوم</SelectItem>
                  <SelectItem value="equity">حقوق ملكية</SelectItem>
                  <SelectItem value="revenue">إيرادات</SelectItem>
                  <SelectItem value="expense">مصروفات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_nature">طبيعة الحساب *</Label>
              <Select
                value={watch("account_nature")}
                onValueChange={(value) => setValue("account_nature", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر طبيعة الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">مدين</SelectItem>
                  <SelectItem value="credit">دائن</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Input
              id="description"
              {...register("description")}
              placeholder="وصف اختياري للحساب"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="is_header"
                checked={watch("is_header")}
                onCheckedChange={(checked) =>
                  setValue("is_header", checked as boolean)
                }
              />
              <Label htmlFor="is_header">حساب رئيسي</Label>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="is_active"
                checked={watch("is_active")}
                onCheckedChange={(checked) =>
                  setValue("is_active", checked as boolean)
                }
              />
              <Label htmlFor="is_active">نشط</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "جاري الحفظ..." : account ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddAccountDialog;
