/**
 * Hook for adding/editing accounts
 */
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountingService } from "@/services";
import { toast } from "sonner";
import { AccountRow } from "@/types/supabase-helpers";
import { QUERY_KEYS } from "@/lib/query-keys";

interface AddAccountFormData {
  code: string;
  name_ar: string;
  name_en?: string;
  parent_id?: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_nature: 'debit' | 'credit';
  is_active: boolean;
  is_header: boolean;
  description?: string;
}

export function useAddAccount(onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ data, existingAccount }: { data: AddAccountFormData; existingAccount?: AccountRow | null }) => {
      setIsSubmitting(true);
      
      // Check for duplicate code
      if (!existingAccount || (existingAccount && existingAccount.code !== data.code)) {
        const existingAccountCheck = await AccountingService.getAccountByCode(data.code);
        if (existingAccountCheck) {
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

      if (existingAccount) {
        return AccountingService.updateAccount(existingAccount.id, accountData);
      } else {
        return AccountingService.createAccount(accountData);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ACCOUNTS });
      toast.success(variables.existingAccount ? "تم تحديث الحساب بنجاح" : "تم إضافة الحساب بنجاح");
      setIsSubmitting(false);
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "حدث خطأ أثناء حفظ الحساب");
      setIsSubmitting(false);
    },
  });

  return {
    isSubmitting,
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
  };
}
