/**
 * Hook لإدارة ختم وتوقيع الوقف
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
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

export const useWaqfBranding = () => {
  const queryClient = useQueryClient();

  const { data: branding, isLoading } = useQuery({
    queryKey: ["waqf-branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waqf_branding")
        .select("*")
        .limit(1)
        .single();

      if (error) throw error;
      return data as WaqfBranding;
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

  const updateNazerName = async (name: string) => {
    await updateBrandingMutation.mutateAsync({ nazer_name: name });
  };

  return {
    branding,
    isLoading,
    uploadStamp,
    uploadSignature,
    updateNazerName,
    isUpdating: updateBrandingMutation.isPending,
  };
};
