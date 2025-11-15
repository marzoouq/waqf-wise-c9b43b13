import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrganizationSettings {
  id: string;
  organization_name_ar: string;
  organization_name_en: string | null;
  vat_registration_number: string;
  commercial_registration_number: string;
  address_ar: string;
  address_en: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useOrganizationSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب الإعدادات
  const { data: settings, isLoading } = useQuery({
    queryKey: ["organization-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as OrganizationSettings | null;
    },
  });

  // إضافة أو تحديث الإعدادات
  const saveMutation = useMutation({
    mutationFn: async (values: Omit<OrganizationSettings, "id" | "created_at" | "updated_at">) => {
      if (settings?.id) {
        // تحديث
        const { data, error } = await supabase
          .from("organization_settings")
          .update({ ...values, updated_at: new Date().toISOString() })
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // إضافة جديد
        const { data, error } = await supabase
          .from("organization_settings")
          .insert(values)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-settings"] });
      toast({
        title: "✅ تم الحفظ",
        description: "تم حفظ إعدادات المنشأة بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    saveSettings: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
  };
};
