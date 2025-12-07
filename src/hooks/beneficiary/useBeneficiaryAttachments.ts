import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export interface BeneficiaryAttachment {
  id: string;
  beneficiary_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  mime_type?: string;
  file_size: number;
  document_type?: string;
  description?: string;
  is_verified?: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  uploaded_by?: string;
  uploaded_by_name?: string;
}

export function useBeneficiaryAttachments(beneficiaryId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch attachments
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
      return data;
    },
    enabled: !!beneficiaryId,
  });

  // Upload attachment
  const uploadAttachment = useMutation({
    mutationFn: async ({
      file,
      documentType,
      description,
    }: {
      file: File;
      documentType: string;
      description?: string;
    }) => {
      if (!beneficiaryId) throw new Error("Beneficiary ID is required");

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${beneficiaryId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("beneficiary-documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("beneficiary-documents")
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data, error } = await supabase
        .from("beneficiary_attachments")
        .insert({
          beneficiary_id: beneficiaryId,
          file_name: file.name,
          file_path: urlData.publicUrl,
          file_type: file.type,
          file_size: file.size,
          document_type: documentType,
          description,
          uploaded_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-attachments", beneficiaryId] });
      toast({
        title: "تم رفع المستند",
        description: "تم رفع المستند بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الرفع",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete attachment
  const deleteAttachment = useMutation({
    mutationFn: async (attachmentId: string) => {
      const attachment = attachments.find((a) => a.id === attachmentId);
      if (!attachment) throw new Error("Attachment not found");

      // Delete from storage
      const fileName = attachment.file_path.split("/").pop();
      if (fileName) {
        await supabase.storage
          .from("beneficiary-documents")
          .remove([`${beneficiaryId}/${fileName}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from("beneficiary_attachments")
        .delete()
        .eq("id", attachmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-attachments", beneficiaryId] });
      toast({
        title: "تم الحذف",
        description: "تم حذف المستند بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    attachments,
    isLoading,
    uploadAttachment: uploadAttachment.mutateAsync,
    deleteAttachment: deleteAttachment.mutateAsync,
  };
}
