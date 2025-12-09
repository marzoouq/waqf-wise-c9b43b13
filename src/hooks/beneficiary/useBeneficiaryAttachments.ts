import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { QUERY_KEYS } from "@/lib/query-keys";

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

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_ATTACHMENTS(beneficiaryId || ''),
    queryFn: async () => {
      if (!beneficiaryId) return [];
      return await BeneficiaryService.getDocuments(beneficiaryId);
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
      return await BeneficiaryService.uploadDocument(beneficiaryId, file, documentType, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_ATTACHMENTS(beneficiaryId || '') });
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
      return await BeneficiaryService.deleteDocument(attachmentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_ATTACHMENTS(beneficiaryId || '') });
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
