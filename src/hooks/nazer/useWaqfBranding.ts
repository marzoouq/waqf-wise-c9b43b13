/**
 * Hook لإدارة ختم وتوقيع وشعار الوقف
 * @version 2.0.0 - إضافة شعار الوقف وخيارات الإظهار
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WaqfBranding {
  id: string;
  stamp_image_url: string | null;
  signature_image_url: string | null;
  nazer_name: string;
  waqf_logo_url: string | null;
  show_logo_in_pdf: boolean;
  show_stamp_in_pdf: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const useWaqfBranding = () => {
  const queryClient = useQueryClient();

  const { data: branding, isLoading } = useQuery({
    queryKey: ["waqf-branding"],
    queryFn: async () => {
      // محاولة الوصول للجدول الكامل (للموظفين المصرح لهم فقط)
      const { data, error } = await supabase
        .from("waqf_branding")
        .select("*")
        .limit(1)
        .maybeSingle();

      // إذا نجح الوصول، أرجع البيانات الكاملة
      if (!error && data) {
        return data as WaqfBranding;
      }

      // للمستخدمين غير المصرح لهم، استخدم الـ View العامة (بدون التوقيع/الختم)
      const { data: publicData } = await supabase
        .from("waqf_branding_public")
        .select("*")
        .limit(1)
        .maybeSingle();

      return publicData as Partial<WaqfBranding> | null;
    },
  });

  const uploadImage = async (file: File, type: "stamp" | "signature" | "logo") => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}_${Date.now()}.${fileExt}`;
    const filePath = `waqf-branding/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const updateBrandingMutation = useMutation({
    mutationFn: async (updates: Partial<WaqfBranding>) => {
      const { error } = await supabase
        .from("waqf_branding")
        .update(updates)
        .eq("id", branding?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waqf-branding"] });
      toast.success("تم تحديث البيانات بنجاح");
    },
    onError: () => {
      toast.error("فشل في تحديث البيانات");
    },
  });

  const uploadStamp = async (file: File) => {
    try {
      const url = await uploadImage(file, "stamp");
      await updateBrandingMutation.mutateAsync({ stamp_image_url: url });
    } catch {
      toast.error("فشل في رفع الختم");
    }
  };

  const uploadSignature = async (file: File) => {
    try {
      const url = await uploadImage(file, "signature");
      await updateBrandingMutation.mutateAsync({ signature_image_url: url });
    } catch {
      toast.error("فشل في رفع التوقيع");
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const url = await uploadImage(file, "logo");
      await updateBrandingMutation.mutateAsync({ waqf_logo_url: url });
    } catch {
      toast.error("فشل في رفع الشعار");
    }
  };

  const updateNazerName = async (name: string) => {
    await updateBrandingMutation.mutateAsync({ nazer_name: name });
  };

  const toggleShowLogo = async (show: boolean) => {
    await updateBrandingMutation.mutateAsync({ show_logo_in_pdf: show });
  };

  const toggleShowStamp = async (show: boolean) => {
    await updateBrandingMutation.mutateAsync({ show_stamp_in_pdf: show });
  };

  return {
    branding,
    isLoading,
    uploadStamp,
    uploadSignature,
    uploadLogo,
    updateNazerName,
    toggleShowLogo,
    toggleShowStamp,
    isUpdating: updateBrandingMutation.isPending,
  };
};
