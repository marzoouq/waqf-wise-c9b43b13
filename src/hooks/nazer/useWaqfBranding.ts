/**
 * Hook لإدارة ختم وتوقيع وشعار الوقف
 * @version 3.0.0 - تم إعادة الكتابة لاستخدام Service Layer
 * 
 * @description
 * يتبع نمط Component → Hook → Service → Supabase
 * يستخدم QUERY_KEYS الموحدة و QUERY_CONFIG
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandingService, type WaqfBranding } from "@/services/branding.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { toast } from "sonner";

export type { WaqfBranding } from "@/services/branding.service";

export const useWaqfBranding = () => {
  const queryClient = useQueryClient();

  const { data: branding, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.WAQF_BRANDING,
    queryFn: () => BrandingService.getBranding(),
    ...QUERY_CONFIG.STATIC,
  });

  const updateBrandingMutation = useMutation({
    mutationFn: async (updates: Partial<WaqfBranding>) => {
      if (!branding?.id) throw new Error("لم يتم تحميل بيانات الهوية البصرية");
      await BrandingService.updateBranding(branding.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.WAQF_BRANDING });
      toast.success("تم تحديث البيانات بنجاح");
    },
    onError: () => {
      toast.error("فشل في تحديث البيانات");
    },
  });

  const uploadStamp = async (file: File) => {
    try {
      const url = await BrandingService.uploadImage(file, "stamp");
      await updateBrandingMutation.mutateAsync({ stamp_image_url: url });
    } catch {
      toast.error("فشل في رفع الختم");
    }
  };

  const uploadSignature = async (file: File) => {
    try {
      const url = await BrandingService.uploadImage(file, "signature");
      await updateBrandingMutation.mutateAsync({ signature_image_url: url });
    } catch {
      toast.error("فشل في رفع التوقيع");
    }
  };

  const uploadLogo = async (file: File) => {
    try {
      const url = await BrandingService.uploadImage(file, "logo");
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
    error,
    uploadStamp,
    uploadSignature,
    uploadLogo,
    updateNazerName,
    toggleShowLogo,
    toggleShowStamp,
    isUpdating: updateBrandingMutation.isPending,
  };
};
