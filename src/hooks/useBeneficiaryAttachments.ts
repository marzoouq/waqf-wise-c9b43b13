import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface BeneficiaryAttachment {
  id: string;
  beneficiary_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  mime_type?: string;
  description?: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
  is_verified: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export function useBeneficiaryAttachments(beneficiaryId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["beneficiary-attachments", beneficiaryId],
    queryFn: async () => {
      if (!beneficiaryId) return [];
      
      const { data, error } = await supabase
        .from("beneficiary_attachments")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BeneficiaryAttachment[];
    },
    enabled: !!beneficiaryId,
  });

  const addAttachment = useMutation({
    mutationFn: async (attachment: Omit<BeneficiaryAttachment, "id" | "created_at" | "updated_at">) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", userData?.user?.id)
        .single();

      const { data, error } = await supabase
        .from("beneficiary_attachments")
        .insert([{
          ...attachment,
          uploaded_by: userData?.user?.id,
          uploaded_by_name: profile?.full_name || "مستخدم",
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-attachments"] });
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم رفع المرفق بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الرفع",
        description: error.message || "حدث خطأ أثناء رفع المرفق",
        variant: "destructive",
      });
    },
  });

  const deleteAttachment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("beneficiary_attachments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-attachments"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المرفق بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف المرفق",
        variant: "destructive",
      });
    },
  });

  return {
    attachments,
    isLoading,
    addAttachment: addAttachment.mutateAsync,
    deleteAttachment: deleteAttachment.mutateAsync,
  };
}
